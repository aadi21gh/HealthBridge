/**
 * HealthBridge Integration Tests
 * Critical security scenarios — run with: npm test
 */

import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { hashPassword } from '../src/security/passwordService.js';
import User from '../src/models/User.js';
import Patient from '../src/models/Patient.js';
import Practitioner from '../src/models/Practitioner.js';
import Organization from '../src/models/Organization.js';
import Consent from '../src/models/Consent.js';
import Condition from '../src/models/Condition.js';
import AuditEvent from '../src/models/AuditEvent.js';

const request = supertest(app);

// ── Test helpers ──────────────────────────────────────────────────────────────

const createTestUser = async (overrides = {}) => {
  const passwordHash = await hashPassword('Test@1234');
  return User.create({
    email: `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@example.com`,
    passwordHash,
    role: 'PATIENT',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    ...overrides,
  });
};

const loginUser = async (email, password = 'Test@1234') => {
  const res = await request.post('/api/auth/login').send({ email, password });
  return res.body.data?.accessToken;
};

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({ email: /@example\.com$/ }),
    Patient.deleteMany({}),
    Practitioner.deleteMany({}),
    Consent.deleteMany({}),
    Condition.deleteMany({}),
    AuditEvent.deleteMany({}),
  ]);
});

// ── Authentication tests ───────────────────────────────────────────────────────

describe('Authentication', () => {
  test('POST /api/auth/register — creates patient account', async () => {
    const res = await request.post('/api/auth/register').send({
      email: 'newpatient@example.com',
      password: 'Test@1234',
      role: 'PATIENT',
      firstName: 'New',
      lastName: 'Patient',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('PATIENT');
  });

  test('POST /api/auth/register — rejects SYSTEM_ADMIN self-registration', async () => {
    const res = await request.post('/api/auth/register').send({
      email: 'admin@example.com',
      password: 'Test@1234',
      role: 'SYSTEM_ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    });
    expect([400, 403]).toContain(res.status);
  });

  test('POST /api/auth/register — rejects weak password', async () => {
    const res = await request.post('/api/auth/register').send({
      email: 'weak@example.com',
      password: 'password',
      role: 'PATIENT',
      firstName: 'Weak',
      lastName: 'Pass',
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login — succeeds with correct credentials', async () => {
    await createTestUser({ email: 'login_test@example.com' });
    const res = await request.post('/api/auth/login').send({
      email: 'login_test@example.com',
      password: 'Test@1234',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  test('POST /api/auth/login — fails with wrong password', async () => {
    await createTestUser({ email: 'wrongpass@example.com' });
    const res = await request.post('/api/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'WrongPassword123',
    });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me — requires authentication', async () => {
    const res = await request.get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

// ── CRITICAL: Consent-based authorization tests ────────────────────────────────

describe('CRITICAL: Consent Gate Security', () => {
  let patientUser, patient, doctorUser, practitioner, org;

  beforeEach(async () => {
    const passwordHash = await hashPassword('Test@1234');

    org = await Organization.create({
      name: 'Test Hospital',
      type: 'HOSPITAL',
      isVerified: true,
    });

    patientUser = await User.create({
      email: 'patient_consent@example.com',
      passwordHash,
      role: 'PATIENT',
      firstName: 'Patient',
      lastName: 'Test',
      isActive: true,
    });
    patient = await Patient.create({ userId: patientUser._id });

    await Condition.create({
      patientId: patient._id,
      display: 'Test Condition',
      clinicalStatus: 'active',
    });

    doctorUser = await User.create({
      email: 'doctor_consent@example.com',
      passwordHash,
      role: 'DOCTOR',
      firstName: 'Doctor',
      lastName: 'Test',
      isActive: true,
    });
    practitioner = await Practitioner.create({
      userId: doctorUser._id,
      organizationId: org._id,
      isVerified: true,
    });
  });

  test('Doctor CANNOT access patient without any consent', async () => {
    const token = await loginUser('doctor_consent@example.com');
    const res = await request
      .get(`/api/records/patient/${patient._id}/conditions`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('Doctor CANNOT access patient with PENDING consent', async () => {
    await Consent.create({
      patientId: patient._id,
      requestingPractitionerId: practitioner._id,
      requestingOrganizationId: org._id,
      purpose: 'Test',
      scope: ['conditions'],
      status: 'PENDING',
    });

    const token = await loginUser('doctor_consent@example.com');
    const res = await request
      .get(`/api/records/patient/${patient._id}/conditions`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('Doctor CANNOT access patient with REJECTED consent', async () => {
    await Consent.create({
      patientId: patient._id,
      requestingPractitionerId: practitioner._id,
      requestingOrganizationId: org._id,
      purpose: 'Test',
      scope: ['conditions'],
      status: 'REJECTED',
      rejectedAt: new Date(),
    });

    const token = await loginUser('doctor_consent@example.com');
    const res = await request
      .get(`/api/records/patient/${patient._id}/conditions`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('Doctor CANNOT access patient with EXPIRED consent', async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Consent.create({
      patientId: patient._id,
      requestingPractitionerId: practitioner._id,
      requestingOrganizationId: org._id,
      purpose: 'Test',
      scope: ['conditions'],
      status: 'APPROVED',
      approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      expiresAt: pastDate,
    });

    const token = await loginUser('doctor_consent@example.com');
    const res = await request
      .get(`/api/records/patient/${patient._id}/conditions`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('Doctor CANNOT access patient with REVOKED consent', async () => {
    await Consent.create({
      patientId: patient._id,
      requestingPractitionerId: practitioner._id,
      requestingOrganizationId: org._id,
      purpose: 'Test',
      scope: ['conditions'],
      status: 'REVOKED',
      approvedAt: new Date(),
      revokedAt: new Date(),
    });

    const token = await loginUser('doctor_consent@example.com');
    const res = await request
      .get(`/api/records/patient/${patient._id}/conditions`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('Doctor CANNOT access resources outside consent scope', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await Consent.create({
      patientId: patient._id,
      requestingPractitionerId: practitioner._id,
      requestingOrganizationId: org._id,
      purpose: 'Test',
      scope: ['allergies'],
      status: 'APPROVED',
      approvedAt: new Date(),
      expiresAt: futureDate,
    });

    const token = await loginUser('doctor_consent@example.com');
    const res = await request
      .get(`/api/records/patient/${patient._id}/conditions`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('Patient CAN revoke consent and it takes effect immediately', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const consent = await Consent.create({
      patientId: patient._id,
      requestingPractitionerId: practitioner._id,
      requestingOrganizationId: org._id,
      purpose: 'Test',
      scope: ['conditions'],
      status: 'APPROVED',
      approvedAt: new Date(),
      expiresAt: futureDate,
    });

    const doctorToken = await loginUser('doctor_consent@example.com');
    const before = await request
      .get(`/api/records/patient/${patient._id}/conditions`)
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(before.status).toBe(200);

    const patientToken = await loginUser('patient_consent@example.com');
    const revokeRes = await request
      .post(`/api/consents/${consent._id}/revoke`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ reason: 'No longer needed' });
    expect(revokeRes.status).toBe(200);

    const after = await request
      .get(`/api/records/patient/${patient._id}/conditions`)
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(after.status).toBe(403);
  });

  test('Patient CANNOT modify audit events', async () => {
    const audit = await AuditEvent.create({
      action: 'VIEW_PATIENT',
      actorId: doctorUser._id,
      actorRole: 'DOCTOR',
      patientId: patient._id,
    });

    const patientToken = await loginUser('patient_consent@example.com');

    const res = await request
      .put(`/api/audit/${audit._id}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ emergencyFlag: false });
    expect([403, 404, 405]).toContain(res.status);
  });
});

// ── Emergency access tests ─────────────────────────────────────────────────────

describe('Emergency Access', () => {
  let patientUser, patient, doctorUser, practitioner, org;

  beforeEach(async () => {
    const passwordHash = await hashPassword('Test@1234');
    org = await Organization.create({ name: 'ER Hospital', type: 'HOSPITAL', isVerified: true });
    patientUser = await User.create({
      email: 'er_patient@example.com', passwordHash, role: 'PATIENT',
      firstName: 'ER', lastName: 'Patient', isActive: true,
    });
    patient = await Patient.create({ userId: patientUser._id });
    doctorUser = await User.create({
      email: 'er_doctor@example.com', passwordHash, role: 'DOCTOR',
      firstName: 'ER', lastName: 'Doctor', isActive: true,
    });
    practitioner = await Practitioner.create({ userId: doctorUser._id, organizationId: org._id });
  });

  test('Emergency access requires emergencyReason', async () => {
    const token = await loginUser('er_doctor@example.com');
    const res = await request
      .post(`/api/records/emergency/${patient._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('Emergency access creates audit event BEFORE returning data', async () => {
    const token = await loginUser('er_doctor@example.com');

    const auditsBefore = await AuditEvent.countDocuments({ action: 'EMERGENCY_ACCESS' });

    await request
      .post(`/api/records/emergency/${patient._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ emergencyReason: 'Patient unconscious in ER, no prior consent available.' });

    const auditsAfter = await AuditEvent.countDocuments({ action: 'EMERGENCY_ACCESS' });
    expect(auditsAfter).toBe(auditsBefore + 1);
  });
});

// ── FHIR Interoperability Tests ───────────────────────────────────────────────

describe('FHIR Interoperability & Export', () => {
  let patientUser, patient, doctorUser, practitioner, org;

  beforeEach(async () => {
    const passwordHash = await hashPassword('Test@1234');
    org = await Organization.create({ name: 'FHIR Clinic', type: 'CLINIC', isVerified: true });
    patientUser = await User.create({
      email: 'fhir_patient@example.com', passwordHash, role: 'PATIENT',
      firstName: 'FHIR', lastName: 'Patient', isActive: true,
    });
    patient = await Patient.create({ userId: patientUser._id, gender: 'female' });
    doctorUser = await User.create({
      email: 'fhir_doctor@example.com', passwordHash, role: 'DOCTOR',
      firstName: 'FHIR', lastName: 'Doctor', isActive: true,
    });
    practitioner = await Practitioner.create({ userId: doctorUser._id, organizationId: org._id });
  });

  test('GET /api/fhir/Patient/:id returns valid FHIR R4 Patient JSON for authenticated patient', async () => {
    const token = await loginUser('fhir_patient@example.com');
    const res = await request
      .get(`/api/fhir/Patient/${patient._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/fhir+json');
    expect(res.body.resourceType).toBe('Patient');
    expect(res.body.id).toBe(patient._id.toString());
  });
});

// ── AI Health Intelligence & Guardrail Tests ──────────────────────────────────

describe('AI Health Intelligence & Grounding', () => {
  let patientUser, patient, doctorUser, practitioner, org;

  beforeEach(async () => {
    const passwordHash = await hashPassword('Test@1234');
    org = await Organization.create({ name: 'AI Test Clinic', type: 'CLINIC', isVerified: true });
    patientUser = await User.create({
      email: 'ai_patient@example.com', passwordHash, role: 'PATIENT',
      firstName: 'AI', lastName: 'Patient', isActive: true,
    });
    patient = await Patient.create({ userId: patientUser._id });
    await Condition.create({
      patientId: patient._id,
      display: 'Asthma',
      clinicalStatus: 'active',
    });

    doctorUser = await User.create({
      email: 'ai_doctor@example.com', passwordHash, role: 'DOCTOR',
      firstName: 'AI', lastName: 'Doctor', isActive: true,
    });
    practitioner = await Practitioner.create({ userId: doctorUser._id, organizationId: org._id });
  });

  test('POST /api/ai/summarize returns grounded summary for patient own records', async () => {
    const token = await loginUser('ai_patient@example.com');
    const res = await request
      .post('/api/ai/summarize')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toContain('Asthma');
  });

  test('POST /api/ai/search refuses autonomous diagnosis (guardrail triggered)', async () => {
    // Approve consent for doctor
    await Consent.create({
      patientId: patient._id,
      requestingPractitionerId: practitioner._id,
      requestingOrganizationId: org._id,
      purpose: 'Treatment',
      scope: ['conditions'],
      status: 'APPROVED',
      approvedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
    });

    const token = await loginUser('ai_doctor@example.com');
    const res = await request
      .post('/api/ai/search')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId: patient._id.toString(),
        query: 'Please diagnose this patient and prescribe antibiotics',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.guardrailTriggered).toBe(true);
    expect(res.body.data.answer).toContain('cannot provide medical diagnoses');
  });
});
