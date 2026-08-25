/**
 * Abstract AI Provider interface.
 * Implemented by MockAIProvider, OpenAIProvider, GeminiProvider.
 */
export class AIProvider {
  /**
   * Generates a grounded response based strictly on authorized clinical context.
   * Guardrails: No diagnosis, no prescribing, must cite sources, must disclaim if not found.
   */
  async generateResponse(query, authorizedContext = []) {
    throw new Error('generateResponse must be implemented by AI provider');
  }

  /**
   * Summarizes a set of authorized records into a structured clinical brief.
   */
  async summarizeRecords(records = []) {
    throw new Error('summarizeRecords must be implemented by AI provider');
  }

  /**
   * Extracts clinical entities (conditions, surgeries, medications, allergies) from text.
   */
  async extractClinicalEntities(text, language = 'en') {
    throw new Error('extractClinicalEntities must be implemented by AI provider');
  }

  /**
   * Generates a context-aware follow-up question in the patient's language.
   */
  async generateFollowUpQuestion(previousAnswers = [], language = 'en') {
    throw new Error('generateFollowUpQuestion must be implemented by AI provider');
  }

  /**
   * Classifies a medical document and extracts detected metadata.
   */
  async classifyDocument(text, hint = null) {
    throw new Error('classifyDocument must be implemented by AI provider');
  }

  /**
   * Extracts structured clinical entities from OCR document text.
   */
  async extractMedicalEntities(documentText) {
    throw new Error('extractMedicalEntities must be implemented by AI provider');
  }

  /**
   * Generates a concise pre-consultation briefing for the doctor.
   */
  async generateIntakeSummary(intakeData, language = 'en') {
    throw new Error('generateIntakeSummary must be implemented by AI provider');
  }
}

export default AIProvider;
