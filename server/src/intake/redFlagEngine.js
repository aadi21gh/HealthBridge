import RedFlagRule from '../models/RedFlagRule.js';
import AuditEvent from '../models/AuditEvent.js';
import logger from '../config/logger.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getRedFlagMessage } from './translations/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaultRules = JSON.parse(readFileSync(join(__dirname, './redFlagRules.json'), 'utf8'));

export class RedFlagEngine {
  constructor() {
    this.cachedRules = null;
    this.lastLoaded = null;
  }

  /**
   * Load active rules from DB, fallback to default seed rules.
   */
  async getActiveRules() {
    try {
      const dbRules = await RedFlagRule.find({ active: true }).lean();
      if (dbRules && dbRules.length > 0) {
        return dbRules;
      }
    } catch (err) {
      logger.warn('Could not load red flag rules from database, using built-in rules', { err: err.message });
    }
    return defaultRules.filter((r) => r.active !== false);
  }

  /**
   * Seed default rules into DB if empty
   */
  async seedDefaultRules() {
    try {
      const count = await RedFlagRule.countDocuments();
      if (count === 0) {
        await RedFlagRule.insertMany(defaultRules);
        logger.info(`Seeded ${defaultRules.length} default red flag rules`);
      }
    } catch (err) {
      logger.warn('Failed to seed default red flag rules', { err: err.message });
    }
  }

  /**
   * Evaluate a session's answers against active red-flag rules.
   * Deterministic matching - NEVER diagnoses, only flags concerning combinations.
   * 
   * @param {Array} answers - Array of answer objects from session
   * @param {Object} context - { patientId, intakeSessionId, organizationId, language, user }
   * @returns {Array} List of triggered red flag objects
   */
  async evaluate(answers = [], context = {}) {
    const rules = await this.getActiveRules();
    const triggeredFlags = [];
    const language = context.language || 'en';

    // Normalize answer inputs for fast condition checking
    const evalContext = this._buildEvaluationContext(answers);

    for (const rule of rules) {
      const isMatch = this._checkRuleMatch(rule, evalContext);
      if (isMatch) {
        const flag = {
          ruleId: rule.ruleId,
          ruleName: rule.name,
          severity: rule.severity,
          message: getRedFlagMessage(rule.messageKey, language) || rule.messageFallback,
          recommendedAction: rule.recommendedAction,
          triggeringAnswers: isMatch.matchedQuestionIds || [],
          triggeredAt: new Date(),
          category: rule.category,
        };
        triggeredFlags.push(flag);

        // Audit the red flag trigger
        if (context.intakeSessionId) {
          AuditEvent.create({
            action: 'KIOSK_RED_FLAG',
            actorId: context.user?.userId || context.patientId || null,
            actorRole: context.user?.role || 'PATIENT',
            patientId: context.patientId,
            organizationId: context.organizationId,
            resourceType: 'IntakeSession',
            resourceId: context.intakeSessionId,
            metadata: {
              ruleId: rule.ruleId,
              severity: rule.severity,
              ruleName: rule.name,
            },
          }).catch((err) => {
            logger.error('Failed to log red flag audit event', { err: err.message, ruleId: rule.ruleId });
          });
        }
      }
    }

    return triggeredFlags;
  }

  _buildEvaluationContext(answers) {
    const ctx = {
      symptoms: new Set(),
      chiefComplaint: '',
      severity: 0,
      pregnancy: null,
      conditions: new Set(),
      answerMap: {},
    };

    for (const a of answers) {
      if (a.skipped) continue;
      ctx.answerMap[a.questionId] = a;

      if (a.clinicalConcept === 'chief_complaint' && a.rawText) {
        ctx.chiefComplaint = a.rawText.toLowerCase();
      }

      if (a.clinicalConcept === 'severity' && a.structuredValue != null) {
        ctx.severity = Number(a.structuredValue);
      }

      if (a.clinicalConcept === 'associated_symptoms') {
        if (Array.isArray(a.structuredValue)) {
          a.structuredValue.forEach((s) => {
            ctx.symptoms.add(s.replace(/^symptom_/, '').toLowerCase());
            ctx.symptoms.add(s.toLowerCase());
          });
        }
      }

      if (a.clinicalConcept === 'pregnancy_status') {
        ctx.pregnancy = a.structuredValue;
      }

      if (a.clinicalConcept === 'past_medical_history' && Array.isArray(a.structuredValue)) {
        a.structuredValue.forEach((c) => ctx.conditions.add(c.toLowerCase()));
      }
    }

    return ctx;
  }

  _checkRuleMatch(rule, ctx) {
    const matchedQuestionIds = [];

    for (const cond of rule.conditions) {
      let matched = false;

      switch (cond.field) {
        case 'symptom': {
          const targetVal = String(cond.value).toLowerCase().replace(/^symptom_/, '');
          if (cond.operator === 'contains' || cond.operator === 'equals') {
            if (ctx.symptoms.has(targetVal) || ctx.chiefComplaint.includes(targetVal)) {
              matched = true;
              matchedQuestionIds.push('hpi_associated');
            }
          }
          break;
        }

        case 'chief_complaint_contains': {
          const target = String(cond.value).toLowerCase();
          if (ctx.chiefComplaint.includes(target)) {
            matched = true;
            matchedQuestionIds.push('chief_complaint');
          }
          break;
        }

        case 'severity': {
          const val = Number(cond.value);
          if (cond.operator === 'gte' && ctx.severity >= val) {
            matched = true;
            matchedQuestionIds.push('hpi_severity');
          } else if (cond.operator === 'gt' && ctx.severity > val) {
            matched = true;
            matchedQuestionIds.push('hpi_severity');
          }
          break;
        }

        case 'pregnancy': {
          if (cond.operator === 'equals' && ctx.pregnancy === cond.value) {
            matched = true;
            matchedQuestionIds.push('pregnancy_status');
          }
          break;
        }

        default:
          break;
      }

      if (!matched) {
        return false; // ALL conditions in a rule must be satisfied
      }
    }

    return { matchedQuestionIds };
  }
}

export default new RedFlagEngine();
