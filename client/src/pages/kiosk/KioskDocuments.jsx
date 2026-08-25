import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KioskLayout from '../../layouts/KioskLayout.jsx';
import { intakeService } from '../../services/intakeService.js';
import {
  Upload,
  Camera,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export default function KioskDocuments() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    sessionId,
    language = 'en',
    discipline = 'MODERN_MEDICINE',
    patientName = 'Patient',
    redFlags = [],
  } = location.state || {};

  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('PRESCRIPTION');
  const [ocrPreview, setOcrPreview] = useState(null);

  const docTypes = [
    { key: 'PRESCRIPTION', label: 'Prescription (Doctor Rx)' },
    { key: 'LAB_REPORT', label: 'Blood / Lab Test Report' },
    { key: 'DISCHARGE_SUMMARY', label: 'Hospital Discharge Summary' },
    { key: 'IMAGING_REPORT', label: 'X-Ray / MRI / CT Scan' },
    { key: 'OPD_NOTE', label: 'OPD Consultation Note' },
    { key: 'OTHER', label: 'Other Medical Record' },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setOcrPreview(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', selectedDocType);

      const result = await intakeService.uploadDocument(sessionId, formData);
      setUploadedDocs((prev) => [...prev, result]);
      setOcrPreview(result);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleSimulateScan = async () => {
    setUploading(true);
    setOcrPreview(null);
    try {
      const blob = new Blob(
        [
          'GENERAL HOSPITAL OPD - Rx: Tab Telmisartan 40mg OD, Tab Metformin 500mg BD. Past Cholecystectomy 2021.',
        ],
        { type: 'text/plain' }
      );
      const testFile = new File([blob], 'Scan_Prescription_2024.pdf', {
        type: 'application/pdf',
      });

      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('documentType', selectedDocType);

      const result = await intakeService.uploadDocument(sessionId, formData);
      setUploadedDocs((prev) => [...prev, result]);
      setOcrPreview(result);
    } catch (err) {
      alert('Upload simulation failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleProceed = () => {
    navigate('/kiosk/review', {
      state: {
        sessionId,
        language,
        discipline,
        patientName,
        redFlags,
        uploadedDocs,
      },
    });
  };

  return (
    <KioskLayout language={language} redFlags={redFlags} title="Document Digitization">
      <div className="w-full max-w-2xl space-y-4 animate-fade-in">
        <div className="kiosk-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 flex-shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-surface-900">
                {language === 'hi'
                  ? 'कागज़ात स्कैन या अपलोड करें'
                  : language === 'mr'
                  ? 'कागदपत्रे स्कॅन किंवा अपलोड करा'
                  : 'Digitize Past Medical Documents'}
              </h2>
              <p className="text-surface-500 text-xs mt-0.5">
                Prescriptions, discharge cards, lab reports, X-rays
              </p>
            </div>
          </div>

          {/* Document Type Selector */}
          <div className="space-y-2">
            <label className="meta-label">
              Select Document Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {docTypes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedDocType(t.key)}
                  className={`p-3 rounded-xl border-2 text-xs font-semibold text-left transition-colors ${
                    selectedDocType === t.key
                      ? 'border-brand-600 bg-brand-50 text-brand-950 font-bold'
                      : 'border-surface-200 bg-surface-50 text-surface-700 hover:border-surface-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload / Camera Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="p-6 rounded-xl border-2 border-dashed border-surface-300 hover:border-brand-500 bg-surface-50 hover:bg-brand-50/40 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
              <Upload className="w-8 h-8 text-brand-600" />
              <div className="text-center">
                <p className="text-surface-900 font-bold text-sm">Upload PDF or Image</p>
                <p className="text-surface-400 text-xs mt-0.5">Tap to choose file</p>
              </div>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            <button
              onClick={handleSimulateScan}
              disabled={uploading}
              className="p-6 rounded-xl border-2 border-surface-200 hover:border-brand-500 bg-surface-50 hover:bg-brand-50/40 flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-8 h-8 text-brand-600" />
              <div className="text-center">
                <p className="text-surface-900 font-bold text-sm">Scan Physical Document</p>
                <p className="text-surface-400 text-xs mt-0.5">Kiosk camera scanner</p>
              </div>
            </button>
          </div>

          {/* Uploading Status */}
          {uploading && (
            <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
              <p className="text-brand-900 font-medium text-xs">Running Optical Character Recognition (OCR)...</p>
            </div>
          )}

          {/* OCR & Entity Extraction Preview Card */}
          {ocrPreview && (
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-3">
              <div className="flex items-center gap-2 text-surface-900 font-bold text-xs">
                <FileText className="w-4 h-4 text-brand-600" />
                <span className="uppercase">OCR Extraction Results</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-surface-200 text-xs font-mono text-surface-700 max-h-32 overflow-y-auto">
                <p className="font-bold text-surface-500 mb-1">Extracted Text:</p>
                {ocrPreview.extractedTextSnippet}
              </div>

              {ocrPreview.extractedFacts && ocrPreview.extractedFacts.length > 0 && (
                <div className="space-y-1.5">
                  <p className="meta-label">Detected Clinical Facts:</p>
                  <div className="space-y-1.5">
                    {ocrPreview.extractedFacts.map((fact, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white border border-surface-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="text-surface-900 font-semibold">{fact.concept}</span>
                          <span className="text-surface-400 ml-1.5">({fact.category})</span>
                        </div>
                        <span className="badge-neutral badge text-[10px]">
                          DOCUMENT EXTRACTED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List of uploaded documents in this session */}
          {uploadedDocs.length > 0 && (
            <div className="space-y-2">
              <p className="meta-label">
                Attached Documents ({uploadedDocs.length}):
              </p>
              <div className="space-y-1.5">
                {uploadedDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-brand-600" />
                      <span className="font-medium text-surface-900 text-xs">
                        {doc.document?.title || doc.document?.fileName || `Document #${idx + 1}`}
                      </span>
                    </div>
                    <span className="text-xs text-success-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Doctor
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-surface-100 flex items-center justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="kiosk-btn-secondary text-xs py-3 px-4 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Questions</span>
            </button>

            <button
              onClick={handleProceed}
              className="kiosk-btn-primary text-xs py-3 px-6 flex items-center gap-2"
            >
              <span>{uploadedDocs.length > 0 ? 'Review & Submit' : 'Skip & Review'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}

