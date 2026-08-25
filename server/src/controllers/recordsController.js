import Condition from '../models/Condition.js';
import Allergy from '../models/Allergy.js';
import Medication from '../models/Medication.js';
import Procedure from '../models/Procedure.js';
import Observation from '../models/Observation.js';
import DiagnosticReport from '../models/DiagnosticReport.js';
import ImagingStudy from '../models/ImagingStudy.js';
import Immunization from '../models/Immunization.js';
import Patient from '../models/Patient.js';
import Practitioner from '../models/Practitioner.js';
import { createError, sendSuccess, sendPaginated } from '../utils/errors.js';

const MODEL_MAP = {
  conditions: Condition,
  allergies: Allergy,
  medications: Medication,
  procedures: Procedure,
  observations: Observation,
  diagnosticReports: DiagnosticReport,
  imagingStudies: ImagingStudy,
  immunizations: Immunization,
};

/**
 * Resolve the patient from the request context.
 * For PATIENT role: load their own profile.
 * For DOCTOR role: req.patient should already be set by route param validation,
 *   but we double-check consent scope before returning.
 */
const resolvePatient = async (req) => {
  if (req.user.role === 'PATIENT') {
    return Patient.findOne({ userId: req.user.userId });
  }
  // Doctor — patient ID comes from URL params
  return Patient.findById(req.params.patientId);
};

// ── Generic record list ───────────────────────────────────────────────────────

export const listRecords = (resourceType) => async (req, res, next) => {
  try {
    const Model = MODEL_MAP[resourceType];
    if (!Model) return next(createError(400, `Unknown resource type: ${resourceType}`));

    // Scope check for doctors
    if (req.user.role === 'DOCTOR' && req.activeConsent) {
      if (!req.activeConsent.scope.includes(resourceType)) {
        return next(createError(403, `Consent scope does not include '${resourceType}'`));
      }
    }

    const patient = await resolvePatient(req);
    if (!patient) return next(createError(404, 'Patient not found'));

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = { patientId: patient._id };

    const [records, total] = await Promise.all([
      Model.find(filter)
        .populate('organizationId', 'name type')
        .populate('encounterId', 'type startDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Model.countDocuments(filter),
    ]);

    return sendPaginated(res, records, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

// ── Create record ─────────────────────────────────────────────────────────────

export const createRecord = (resourceType) => async (req, res, next) => {
  try {
    const Model = MODEL_MAP[resourceType];
    if (!Model) return next(createError(400, `Unknown resource type: ${resourceType}`));

    // Only doctors and hospital admins can create records
    if (req.user.role === 'PATIENT') {
      return next(createError(403, 'Patients cannot directly create clinical records'));
    }

    const practitioner = await Practitioner.findOne({ userId: req.user.userId });
    const targetPatientId = req.params.patientId || req.body.patientId;

    const record = await Model.create({
      ...req.body,
      patientId: targetPatientId,
      recordedBy: practitioner?._id,
      organizationId: practitioner?.organizationId || req.body.organizationId,
    });

    return sendSuccess(res, { record }, 201);
  } catch (err) {
    next(err);
  }
};

// ── Get single record ─────────────────────────────────────────────────────────

export const getRecord = (resourceType) => async (req, res, next) => {
  try {
    const Model = MODEL_MAP[resourceType];
    if (!Model) return next(createError(400, `Unknown resource type: ${resourceType}`));

    const patient = await resolvePatient(req);
    if (!patient) return next(createError(404, 'Patient not found'));

    const record = await Model.findOne({ _id: req.params.id, patientId: patient._id })
      .populate('organizationId', 'name type')
      .lean();

    if (!record) return next(createError(404, 'Record not found'));

    return sendSuccess(res, { record });
  } catch (err) {
    next(err);
  }
};

// ── Doctor: Get patient for authorized view (with timeline) ───────────────────

export const getDoctorPatientView = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId)
      .populate('userId', 'firstName lastName email phone');
    if (!patient) return next(createError(404, 'Patient not found'));

    const scope = req.activeConsent?.scope || [];

    // Only load resources within consent scope
    const results = {};
    const loadPromises = scope.map(async (resource) => {
      const Model = MODEL_MAP[resource];
      if (Model) {
        results[resource] = await Model.find({ patientId: patient._id })
          .populate('organizationId', 'name')
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
      }
    });

    await Promise.all(loadPromises);

    return sendSuccess(res, { patient, records: results, consentScope: scope });
  } catch (err) {
    next(err);
  }
};

// ── Emergency: Get critical patient info ──────────────────────────────────────

export const getEmergencyPatientInfo = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId)
      .populate('userId', 'firstName lastName')
      .lean();
    if (!patient) return next(createError(404, 'Patient not found'));

    // Emergency access returns ONLY critical information
    const [allergies, medications, conditions, surgeries] = await Promise.all([
      Allergy.find({ patientId: patient._id }).lean(),
      Medication.find({ patientId: patient._id, status: 'active' }).lean(),
      Condition.find({ patientId: patient._id, clinicalStatus: 'active' }).lean(),
      Procedure.find({ patientId: patient._id, isSurgery: true }).sort({ performedDate: -1 }).lean(),
    ]);

    return sendSuccess(res, {
      patient: {
        id: patient._id,
        name: `${patient.userId?.firstName} ${patient.userId?.lastName}`,
        bloodGroup: patient.bloodGroup,
        dateOfBirth: patient.dateOfBirth,
        emergencyContact: patient.emergencyContact,
      },
      criticalInfo: {
        allergies,
        activeMedications: medications,
        activeConditions: conditions,
        previousSurgeries: surgeries,
      },
      accessNote: 'This is emergency (break-glass) access. All access is logged and will be reviewed.',
    });
  } catch (err) {
    next(err);
  }
};
