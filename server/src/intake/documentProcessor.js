import Document from '../models/Document.js';
import ClinicalFact from '../models/ClinicalFact.js';
import LocalStorageProvider from '../storage/LocalStorageProvider.js';
import MockAIProvider from '../ai/providers/MockAIProvider.js';
import crypto from 'crypto';
import logger from '../config/logger.js';

const storage = new LocalStorageProvider();
const aiProvider = new MockAIProvider();

export class DocumentProcessor {
  /**
   * Process an uploaded physical medical document in the Kiosk intake flow.
   * Steps:
   * 1. Save file to storage
   * 2. Perform OCR / text extraction
   * 3. AI document classification & entity extraction
   * 4. Create Document record
   * 5. Extract prospective ClinicalFacts with DOCUMENT_EXTRACTED source
   * 6. Return structured preview for patient & doctor review
   */
  async processKioskDocument({
    fileBuffer,
    fileName,
    mimeType,
    sizeBytes,
    patientId,
    intakeSessionId,
    organizationId,
    uploadedBy,
    documentTypeHint,
  }) {
    // 1. Generate secure storage key
    const storageKey = `kiosk/${organizationId || 'org'}/${patientId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${fileName}`;
    await storage.saveFile(fileBuffer, storageKey, mimeType);

    // 2. Mock / Real text extraction (simulates OCR for images/PDFs)
    const ocrResult = await this._simulateOCR(fileName, mimeType);

    // 3. Classify document type and extract medical entities using AI
    const classification = await aiProvider.classifyDocument(ocrResult.text, documentTypeHint);
    const extractedEntities = await aiProvider.extractMedicalEntities(ocrResult.text);

    // 4. Create Document entity
    const document = await Document.create({
      patientId,
      organizationId,
      uploadedBy,
      documentType: classification.documentType || documentTypeHint || 'OTHER',
      title: classification.detectedTitle || fileName,
      fileName,
      mimeType,
      sizeBytes,
      storageKey,
      extractedText: ocrResult.text,
      extractionConfidence: ocrResult.confidence,
      extractionMethod: ocrResult.method,
      extractedAt: new Date(),
      status: 'READY',
      recordDate: classification.detectedDate || new Date(),
    });

    // 5. Structure extracted entities into preliminary ClinicalFacts
    const prospectiveFacts = [];
    if (extractedEntities && extractedEntities.length > 0) {
      for (const entity of extractedEntities) {
        const fact = await ClinicalFact.create({
          patientId,
          intakeSessionId,
          category: entity.category,
          concept: entity.concept,
          value: entity.value || null,
          approximateDate: entity.date || null,
          source: 'DOCUMENT_EXTRACTED',
          sourceDocumentId: document._id,
          originalText: entity.snippet || ocrResult.text.substring(0, 150),
          verified: false,
          verificationStatus: 'PENDING',
          confidence: entity.confidence || 0.85,
        });
        prospectiveFacts.push(fact);
      }
    }

    logger.info('Kiosk document processed successfully', {
      documentId: document._id,
      patientId,
      factCount: prospectiveFacts.length,
    });

    return {
      document,
      extractedTextSnippet: ocrResult.text.substring(0, 300),
      classification,
      extractedFacts: prospectiveFacts,
    };
  }

  async _simulateOCR(fileName, mimeType) {
    // In production, invoke Tesseract.js / AWS Textract / Google Cloud Vision
    // Here we provide realistic simulated OCR text based on common document patterns
    const nameLower = fileName.toLowerCase();

    let sampleText = `MEDICAL RECORD - GENERAL HOSPITAL
Date of examination: 2024-03-15
Patient Medical Summary
Past History: Essential Hypertension on Telmisartan 40mg OD.
Past Surgery: Laparoscopic Cholecystectomy performed in 2021 uneventful recovery.
Allergies: Penicillin allergy (urticarial rash).
Recommendations: Routine annual follow-up, lipid profile check.`;

    if (nameLower.includes('lab') || nameLower.includes('blood')) {
      sampleText = `METROPOLIS DIAGNOSTIC LAB REPORT
Date: 2024-04-10
Test Name: Complete Blood Count & HbA1c
HbA1c: 6.8% (Pre-diabetic / Mild Diabetic range)
Fasting Blood Sugar: 126 mg/dL
Total Cholesterol: 210 mg/dL
Remarks: Suggest lifestyle modification & endocrinology consultation.`;
    } else if (nameLower.includes('rx') || nameLower.includes('prescrip')) {
      sampleText = `PRESCRIPTION CLINIC OPD
Rx:
1. Tab Metformin 500mg - 1 tablet twice daily after meals
2. Tab Telmisartan 40mg - 1 tablet once daily morning
3. Tab Pantoprazole 40mg - 1 tablet before breakfast
Advised low salt, low sugar diet. Follow up in 1 month.`;
    }

    return {
      text: sampleText,
      confidence: 0.94,
      method: 'ocr',
    };
  }
}

export default new DocumentProcessor();
