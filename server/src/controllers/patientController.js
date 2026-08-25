import Patient from '../models/Patient.js';
import User from '../models/User.js';
import Condition from '../models/Condition.js';
import Allergy from '../models/Allergy.js';
import Medication from '../models/Medication.js';
import Procedure from '../models/Procedure.js';
import Observation from '../models/Observation.js';
import DiagnosticReport from '../models/DiagnosticReport.js';
import ImagingStudy from '../models/ImagingStudy.js';
import Encounter from '../models/Encounter.js';
import Immunization from '../models/Immunization.js';
import Document from '../models/Document.js';
import { createError, sendSuccess, sendPaginated } from '../utils/errors.js';

// ── Get own patient profile ───────────────────────────────────────────────────

export const getMyProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId })
      .populate('userId', 'firstName lastName email phone');

    if (!patient) return next(createError(404, 'Patient profile not found'));

    return sendSuccess(res, { patient });
  } catch (err) {
    next(err);
  }
};

// ── Update own patient profile ────────────────────────────────────────────────

export const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'dateOfBirth', 'gender', 'bloodGroup', 'height', 'weight',
      'emergencyContact', 'address',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone');

    if (!patient) return next(createError(404, 'Patient profile not found'));

    return sendSuccess(res, { patient });
  } catch (err) {
    next(err);
  }
};

// ── Get patient medical timeline ──────────────────────────────────────────────

export const getMyTimeline = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId });
    if (!patient) return next(createError(404, 'Patient profile not found'));

    const { from, to, type, organizationId } = req.query;

    const baseFilter = { patientId: patient._id };
    if (organizationId) baseFilter.organizationId = organizationId;

    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    // Fetch all timeline resources in parallel
    const [encounters, conditions, procedures, diagnosticReports, imagingStudies, immunizations] =
      await Promise.all([
        Encounter.find({ ...baseFilter, ...(Object.keys(dateFilter).length ? { startDate: dateFilter } : {}) })
          .populate('organizationId', 'name type')
          .populate('practitionerId', 'userId specialization')
          .sort({ startDate: -1 })
          .lean(),
        Condition.find(baseFilter)
          .populate('organizationId', 'name')
          .sort({ onsetDate: -1 })
          .lean(),
        Procedure.find({ ...baseFilter, ...(Object.keys(dateFilter).length ? { performedDate: dateFilter } : {}) })
          .populate('organizationId', 'name')
          .sort({ performedDate: -1 })
          .lean(),
        DiagnosticReport.find({ ...baseFilter, ...(Object.keys(dateFilter).length ? { effectiveDate: dateFilter } : {}) })
          .populate('organizationId', 'name')
          .sort({ effectiveDate: -1 })
          .lean(),
        ImagingStudy.find({ ...baseFilter, ...(Object.keys(dateFilter).length ? { studyDate: dateFilter } : {}) })
          .populate('organizationId', 'name')
          .sort({ studyDate: -1 })
          .lean(),
        Immunization.find({ ...baseFilter, ...(Object.keys(dateFilter).length ? { occurrenceDate: dateFilter } : {}) })
          .populate('organizationId', 'name')
          .sort({ occurrenceDate: -1 })
          .lean(),
      ]);

    // Build unified timeline events
    const events = [
      ...encounters.map((e) => ({ ...e, _timelineType: 'Encounter', _date: e.startDate })),
      ...procedures.map((p) => ({ ...p, _timelineType: 'Procedure', _date: p.performedDate })),
      ...diagnosticReports.map((d) => ({ ...d, _timelineType: 'DiagnosticReport', _date: d.effectiveDate })),
      ...imagingStudies.map((i) => ({ ...i, _timelineType: 'ImagingStudy', _date: i.studyDate })),
      ...immunizations.map((imm) => ({ ...imm, _timelineType: 'Immunization', _date: imm.occurrenceDate })),
    ];

    // Sort descending by date
    events.sort((a, b) => new Date(b._date) - new Date(a._date));

    // Group by year for frontend timeline rendering
    const byYear = {};
    for (const event of events) {
      const year = event._date ? new Date(event._date).getFullYear() : 'Unknown';
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(event);
    }

    return sendSuccess(res, {
      timeline: events,
      byYear,
      summary: {
        totalEncounters: encounters.length,
        totalProcedures: procedures.length,
        totalDiagnosticReports: diagnosticReports.length,
        totalImagingStudies: imagingStudies.length,
        conditions: conditions.filter((c) => c.clinicalStatus === 'active'),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get patient summary (dashboard) ──────────────────────────────────────────

export const getMySummary = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.userId })
      .populate('userId', 'firstName lastName email phone');
    if (!patient) return next(createError(404, 'Patient profile not found'));

    const [conditions, allergies, medications, recentEncounters] = await Promise.all([
      Condition.find({ patientId: patient._id, clinicalStatus: 'active' }).lean(),
      Allergy.find({ patientId: patient._id }).lean(),
      Medication.find({ patientId: patient._id, status: 'active' }).lean(),
      Encounter.find({ patientId: patient._id })
        .populate('organizationId', 'name type')
        .sort({ startDate: -1 })
        .limit(5)
        .lean(),
    ]);

    return sendSuccess(res, {
      patient,
      summary: {
        activeConditions: conditions,
        allergies,
        activeMedications: medications,
        recentEncounters,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Doctor/Admin: search patients ──────────────────────────────────────────

export const searchPatients = async (req, res, next) => {
  try {
    const { q } = req.query;
    let filter = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      const users = await User.find({
        role: 'PATIENT',
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { phone: regex }],
      }).select('_id');
      const userIds = users.map((u) => u._id);
      filter = {
        $or: [
          { userId: { $in: userIds } },
          ...(q.trim().match(/^[0-9a-fA-F]{24}$/) ? [{ _id: q.trim() }] : []),
        ],
      };
    } else {
      const users = await User.find({ role: 'PATIENT' }).select('_id');
      filter = { userId: { $in: users.map((u) => u._id) } };
    }

    const patients = await Patient.find(filter)
      .populate('userId', 'firstName lastName email phone')
      .limit(20)
      .lean();

    return sendSuccess(res, { patients });
  } catch (err) {
    next(err);
  }
};

// ── Doctor: get authorized patient profile ────────────────────────────────────

export const getPatientById = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId)
      .populate('userId', 'firstName lastName email phone');
    if (!patient) return next(createError(404, 'Patient not found'));

    return sendSuccess(res, { patient });
  } catch (err) {
    next(err);
  }
};

