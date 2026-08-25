import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { consentGate } from '../middleware/consentGate.js';
import { auditLog } from '../middleware/auditLog.js';
import LocalDatabaseProvider from '../integrations/fhir/LocalDatabaseProvider.js';
import FHIRMapper from '../integrations/fhir/FHIRMapper.js';
import { createError } from '../utils/errors.js';

const router = Router();
const dataProvider = new LocalDatabaseProvider();

router.use(authenticate);

// GET /api/fhir/Patient/:patientId
router.get(
  '/Patient/:patientId',
  requireRole('PATIENT', 'DOCTOR', 'SYSTEM_ADMIN'),
  consentGate(),
  auditLog('VIEW_PATIENT', 'FHIR_Patient'),
  async (req, res, next) => {
    try {
      const patient = await dataProvider.getPatient(req.params.patientId);
      if (!patient) return next(createError(404, 'Patient resource not found'));

      const fhirResource = FHIRMapper.Patient.toFHIR(patient, patient.userId);
      res.setHeader('Content-Type', 'application/fhir+json');
      return res.json(fhirResource);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/fhir/Condition?patient=:patientId
router.get(
  '/Condition',
  requireRole('PATIENT', 'DOCTOR', 'SYSTEM_ADMIN'),
  (req, res, next) => {
    req.params.patientId = req.query.patient || req.patient?._id?.toString();
    next();
  },
  consentGate('conditions'),
  auditLog('VIEW_RECORD', 'FHIR_Condition'),
  async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      if (!patientId) return next(createError(400, 'Missing patient query parameter'));

      const conditions = await dataProvider.getConditions(patientId);
      const fhirResources = conditions.map((c) => FHIRMapper.Condition.toFHIR(c));
      const bundle = FHIRMapper.createBundle('searchset', fhirResources);

      res.setHeader('Content-Type', 'application/fhir+json');
      return res.json(bundle);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/fhir/Observation?patient=:patientId
router.get(
  '/Observation',
  requireRole('PATIENT', 'DOCTOR', 'SYSTEM_ADMIN'),
  (req, res, next) => {
    req.params.patientId = req.query.patient || req.patient?._id?.toString();
    next();
  },
  consentGate('observations'),
  auditLog('VIEW_RECORD', 'FHIR_Observation'),
  async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      if (!patientId) return next(createError(400, 'Missing patient query parameter'));

      const observations = await dataProvider.getObservations(patientId);
      const fhirResources = observations.map((o) => FHIRMapper.Observation.toFHIR(o));
      const bundle = FHIRMapper.createBundle('searchset', fhirResources);

      res.setHeader('Content-Type', 'application/fhir+json');
      return res.json(bundle);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/fhir/Procedure?patient=:patientId
router.get(
  '/Procedure',
  requireRole('PATIENT', 'DOCTOR', 'SYSTEM_ADMIN'),
  (req, res, next) => {
    req.params.patientId = req.query.patient || req.patient?._id?.toString();
    next();
  },
  consentGate('procedures'),
  auditLog('VIEW_RECORD', 'FHIR_Procedure'),
  async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      if (!patientId) return next(createError(400, 'Missing patient query parameter'));

      const procedures = await dataProvider.getProcedures(patientId);
      const fhirResources = procedures.map((p) => FHIRMapper.Procedure.toFHIR(p));
      const bundle = FHIRMapper.createBundle('searchset', fhirResources);

      res.setHeader('Content-Type', 'application/fhir+json');
      return res.json(bundle);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
