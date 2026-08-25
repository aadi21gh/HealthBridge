/**
 * Conversational Intake Engine
 *
 * Determines the next question dynamically based on:
 * - Previously answered questions
 * - Conditional branching rules from the question bank
 * - Patient context (gender, age, etc.)
 * - AI-assisted follow-up (optional)
 *
 * Supports: text, voice, skip, I don't know, back, not applicable, clarification
 */
import { questionBank } from './questionBank.js';
import { getQuestionText, getOptionLabel, getTranslation } from './translations/index.js';

export class ConversationEngine {
  constructor(language = 'en', patientContext = {}) {
    this.language = language;
    this.patientContext = patientContext; // { gender, age, ... }
    this.questions = questionBank;
  }

  /**
   * Build the answers lookup from an array of answer objects.
   * Returns { [questionId]: answerObject }
   */
  _buildAnswerMap(answersArray = []) {
    const map = {};
    for (const ans of answersArray) {
      map[ans.questionId] = ans;
    }
    return map;
  }

  /**
   * Get the next unanswered question that meets its conditions.
   * Returns null if all applicable questions have been answered.
   */
  getNextQuestion(answersArray = []) {
    const answerMap = this._buildAnswerMap(answersArray);

    for (const q of this.questions) {
      // Skip already answered
      if (answerMap[q.id]) continue;

      // Check condition
      if (q.condition && !q.condition(answerMap, this.patientContext)) {
        continue;
      }

      return this._formatQuestion(q);
    }

    return null; // All questions answered
  }

  /**
   * Get a specific question by ID.
   */
  getQuestion(questionId) {
    const q = this.questions.find((q) => q.id === questionId);
    if (!q) return null;
    return this._formatQuestion(q);
  }

  /**
   * Get all applicable questions for current context (for review screen).
   */
  getAllApplicableQuestions(answersArray = []) {
    const answerMap = this._buildAnswerMap(answersArray);
    const applicable = [];

    for (const q of this.questions) {
      if (q.condition && !q.condition(answerMap, this.patientContext)) {
        continue;
      }
      applicable.push({
        ...this._formatQuestion(q),
        answered: !!answerMap[q.id],
        answer: answerMap[q.id] || null,
      });
    }

    return applicable;
  }

  /**
   * Get progress information.
   */
  getProgress(answersArray = []) {
    const answerMap = this._buildAnswerMap(answersArray);
    let total = 0;
    let answered = 0;

    for (const q of this.questions) {
      if (q.condition && !q.condition(answerMap, this.patientContext)) {
        continue;
      }
      total++;
      if (answerMap[q.id]) answered++;
    }

    return {
      total,
      answered,
      remaining: total - answered,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
    };
  }

  /**
   * Validate an answer for a given question.
   * Returns { valid, error }
   */
  validateAnswer(questionId, answer) {
    const q = this.questions.find((q) => q.id === questionId);
    if (!q) return { valid: false, error: 'Question not found' };

    // Skip and special inputs are always valid
    if (answer.skipped) return { valid: true };
    if (answer.inputMethod === 'skip' || answer.inputMethod === 'not_applicable') {
      return { valid: true };
    }

    // Required check
    if (q.required && !answer.rawText && !answer.structuredValue) {
      return { valid: false, error: 'This question requires an answer' };
    }

    // Scale validation
    if (q.inputType === 'scale' && answer.structuredValue != null) {
      const val = Number(answer.structuredValue);
      if (isNaN(val) || val < q.scale.min || val > q.scale.max) {
        return { valid: false, error: `Please select a value between ${q.scale.min} and ${q.scale.max}` };
      }
    }

    return { valid: true };
  }

  /**
   * Process an answer and return structured format.
   */
  processAnswer(questionId, rawInput, inputMethod = 'text') {
    const q = this.questions.find((q) => q.id === questionId);
    if (!q) return null;

    const answer = {
      questionId,
      clinicalConcept: q.clinicalConcept,
      category: q.category,
      rawText: typeof rawInput === 'string' ? rawInput : null,
      language: this.language,
      inputMethod,
      skipped: false,
      skipReason: null,
      answeredAt: new Date(),
    };

    // Handle special inputs
    if (inputMethod === 'skip') {
      answer.skipped = true;
      answer.skipReason = 'skip';
      return answer;
    }
    if (inputMethod === 'not_applicable') {
      answer.skipped = true;
      answer.skipReason = 'not_applicable';
      return answer;
    }
    if (rawInput === '__dont_know__') {
      answer.skipped = true;
      answer.skipReason = 'dont_know';
      answer.rawText = null;
      return answer;
    }
    if (rawInput === '__dont_remember__') {
      answer.skipped = true;
      answer.skipReason = 'dont_remember';
      answer.rawText = null;
      return answer;
    }

    // Process based on input type
    switch (q.inputType) {
      case 'yesno':
        answer.structuredValue = rawInput === true || rawInput === 'yes' || rawInput === 'true';
        answer.rawText = answer.structuredValue ? 'Yes' : 'No';
        break;

      case 'scale':
        answer.structuredValue = Number(rawInput);
        answer.rawText = String(rawInput);
        break;

      case 'select':
        answer.structuredValue = rawInput; // option key
        answer.rawText = getOptionLabel(rawInput, this.language);
        break;

      case 'multi':
        answer.structuredValue = Array.isArray(rawInput) ? rawInput : [rawInput];
        answer.rawText = answer.structuredValue
          .map((key) => getOptionLabel(key, this.language))
          .join(', ');
        break;

      default:
        // text / voice
        answer.structuredValue = rawInput;
        break;
    }

    return answer;
  }

  /**
   * Format a question for output with translated text.
   */
  _formatQuestion(q) {
    const formatted = {
      id: q.id,
      clinicalConcept: q.clinicalConcept,
      category: q.category,
      inputType: q.inputType,
      required: q.required,
      text: getQuestionText(q.id, this.language),
    };

    if (q.optionKeys) {
      formatted.options = q.optionKeys.map((key) => ({
        key,
        label: getOptionLabel(key, this.language),
      }));
    }

    if (q.scale) {
      formatted.scale = q.scale;
    }

    return formatted;
  }
}

export default ConversationEngine;
