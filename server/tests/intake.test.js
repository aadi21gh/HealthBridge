import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Patient from '../src/models/Patient.js';
import Organization from '../src/models/Organization.js';
import Practitioner from '../src/models/Practitioner.js';
import IntakeSession from '../src/models/IntakeSession.js';
import ClinicalFact from '../src/models/ClinicalFact.js';
import Condition from '../src/models/Condition.js';
import { generateAccessToken } from '../src/security/tokenService.js';
import { connectDB, disconnectDB } from '../src/config/database.js';

describe('India-First Multilingual Kiosk Clinical Intake Module', () => {
  let doctorToken;
  let adminToken;
  let doctorUser;
  let adminUser;
  let practitioner;
  let testPatient;
  let testUser;
  let organization;

  beforeAll(async () => {
    await connectDB();

    // 1. Create Organization
    organization = await Organization.create({
      name: 'AIIMS New Delhi',
      type: 'HOSPITAL',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
    });

    // 2. Create Admin
    adminUser = await User.create({
      email: `admin_kiosk_${Date.now()}@healthbridge.org`,
      passwordHash: 'dummy_hash_value',
      role: 'HOSPITAL_ADMIN',
      firstName: 'Admin',
      lastName: 'AIIMS',
    });

    adminToken = generateAccessToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    // 3. Create Doctor
    doctorUser = await User.create({
      email: `dr_intake_${Date.now()}_${Math.random().toString(36).substr(2, 4)}@healthbridge.org`,
      passwordHash: 'dummy_hash_value',
      role: 'DOCTOR',
      firstName: 'Priya',
      lastName: 'Nair',
    });

    practitioner = await Practitioner.create({
      userId: doctorUser._id,
      organizationId: organization._id,
      specialization: 'General Medicine',
      licenseNumber: `MCI-${Date.now()}`,
    });

    doctorToken = generateAccessToken({
      userId: doctorUser._id.toString(),
      email: doctorUser.email,
      role: doctorUser.role,
    });

    // 4. Create Patient
    const uniquePhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const uniqueAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    testUser = await User.create({
      email: `patient_intake_${Date.now()}_${Math.random().toString(36).substr(2, 4)}@healthbridge.org`,
      passwordHash: 'dummy_hash_value',
      role: 'PATIENT',
      firstName: 'Aarav',
      lastName: 'Patil',
      phone: uniquePhone,
    });

    testPatient = await Patient.create({
      userId: testUser._id,
      gender: 'male',
      bloodGroup: 'B+',
      abhaId: uniqueAbha,
    });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Kiosk Patient Search & Identification', () => {
    it('should find patient profile by phone number', async () => {
      const res = await request(app)
        .post('/api/intake/patient-search')
        .send({ phone: testUser.phone });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patients.length).toBeGreaterThan(0);
      expect(res.body.data.patients[0].firstName).toBe('Aarav');
    });

    it('should find patient profile by ABHA ID', async () => {
      const res = await request(app)
        .post('/api/intake/patient-search')
        .send({ abhaId: testPatient.abhaId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patients[0].abhaId).toBe(testPatient.abhaId);
    });
  });

  describe('2. Multilingual Question Bank & Translations', () => {
    it('should retrieve Hindi translated questions and options', async () => {
      const res = await request(app).get('/api/intake/questions/hi');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.language).toBe('hi');
      expect(res.body.data.translations.questions.chief_complaint).toContain('परेशानी');
    });

    it('should retrieve Marathi translated questions', async () => {
      const res = await request(app).get('/api/intake/questions/mr');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.language).toBe('mr');
      expect(res.body.data.translations.questions.chief_complaint).toContain('समस्या');
    });
  });

  describe('3. Kiosk Intake Session & Conversational Engine Flow', () => {
    let sessionId;

    it('should start a new Kiosk intake session with consent', async () => {
      const res = await request(app)
        .post('/api/intake/sessions')
        .send({
          patientId: testPatient._id,
          organizationId: organization._id,
          language: 'en',
          discipline: 'MODERN_MEDICINE',
          consentGiven: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session.status).toBe('IN_PROGRESS');
      expect(res.body.data.currentQuestion.id).toBe('chief_complaint');

      sessionId = res.body.data.session._id;
    });

    it('should submit chief complaint and trigger dynamic next question (HPI onset)', async () => {
      const res = await request(app)
        .post(`/api/intake/sessions/${sessionId}/answer`)
        .send({
          questionId: 'chief_complaint',
          rawInput: 'Severe chest pain and breathlessness',
          inputMethod: 'text',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nextQuestion.id).toBe('hpi_onset');
    });

    it('should trigger deterministic Red-Flag screening when urgent symptom combination is reported', async () => {
      // Add symptoms: chest pain + breathlessness + sweating
      await request(app)
        .post(`/api/intake/sessions/${sessionId}/answer`)
        .send({
          questionId: 'hpi_severity',
          rawInput: 8,
          inputMethod: 'scale',
        });

      const res = await request(app)
        .post(`/api/intake/sessions/${sessionId}/answer`)
        .send({
          questionId: 'hpi_associated',
          rawInput: ['symptom_chest_pain', 'symptom_breathlessness', 'symptom_sweating'],
          inputMethod: 'multi',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.redFlags.length).toBeGreaterThan(0);
      expect(res.body.data.redFlags[0].severity).toBe('URGENT');
      expect(res.body.data.redFlags[0].ruleId).toBe('RF-CARDIO-001');
    });

    it('should upload a medical document and run OCR & preliminary entity extraction', async () => {
      const samplePdfBuffer = Buffer.from(
        'OPD PRESCRIPTION: Tab Telmisartan 40mg OD. Laparoscopic Cholecystectomy 2021.'
      );

      const res = await request(app)
        .post(`/api/intake/sessions/${sessionId}/documents`)
        .attach('file', samplePdfBuffer, 'test_prescription.pdf')
        .field('documentType', 'PRESCRIPTION');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.document.documentType).toBe('PRESCRIPTION');
      expect(res.body.data.extractedFacts.length).toBeGreaterThan(0);
      expect(res.body.data.extractedFacts[0].source).toBe('DOCUMENT_EXTRACTED');
    });

    it('should complete the kiosk session, build pre-consultation summary, and create encounter', async () => {
      const res = await request(app).post(`/api/intake/sessions/${sessionId}/complete`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session.status).toBe('COMPLETED');
      expect(res.body.data.encounterId).toBeDefined();
      expect(res.body.data.summary).toContain('Chief Complaint');
    });
  });

  describe('4. AYUSH Specific Assessment Pathway', () => {
    it('should get Ayurveda assessment structure', async () => {
      const res = await request(app).get('/api/intake/ayush/AYURVEDA');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.module.fields.some((f) => f.fieldKey === 'prakriti')).toBe(true);
      expect(res.body.data.module.fields.some((f) => f.fieldKey === 'agni')).toBe(true);
    });

    it('should record an Ayurvedic assessment linked to a session', async () => {
      const session = await IntakeSession.create({
        patientId: testPatient._id,
        organizationId: organization._id,
        language: 'en',
        discipline: 'AYURVEDA',
        status: 'IN_PROGRESS',
      });

      const res = await request(app)
        .post('/api/intake/ayush/AYURVEDA/assessment')
        .send({
          patientId: testPatient._id,
          intakeSessionId: session._id,
          assessments: [
            { fieldKey: 'prakriti', fieldLabel: 'Prakriti', value: 'prakriti_pitta_kapha' },
            { fieldKey: 'agni', fieldLabel: 'Agni', value: 'agni_tikshna' },
            { fieldKey: 'koshta', fieldLabel: 'Koshta', value: 'koshta_mridu' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assessment.discipline).toBe('AYURVEDA');
    });
  });

  describe('5. Doctor Pre-Consultation Briefing & Fact Verification', () => {
    let completedSession;
    let testFact;

    beforeAll(async () => {
      completedSession = await IntakeSession.create({
        patientId: testPatient._id,
        organizationId: organization._id,
        practitionerId: practitioner._id,
        language: 'en',
        discipline: 'MODERN_MEDICINE',
        status: 'COMPLETED',
        structuredData: {
          chiefComplaint: 'Abdominal pain x 3 days',
          hpiSummary: 'Pain started 3 days ago, severity 7/10',
        },
      });

      testFact = await ClinicalFact.create({
        patientId: testPatient._id,
        intakeSessionId: completedSession._id,
        category: 'surgery',
        concept: 'Cholecystectomy',
        approximateDate: '2021',
        source: 'PATIENT_REPORTED',
        originalText: 'I had gallbladder surgery around 2021',
        verified: false,
        verificationStatus: 'PENDING',
      });
    });

    it('should allow authorized doctor to view intake briefing with provenance', async () => {
      const res = await request(app)
        .get(`/api/intake/doctor/briefing/${completedSession._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.facts.length).toBeGreaterThan(0);
      expect(res.body.data.facts[0].source).toBe('PATIENT_REPORTED');
    });

    it('should allow doctor to verify and accept a clinical fact', async () => {
      const res = await request(app)
        .post(`/api/intake/doctor/facts/${testFact._id}/verify`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          action: 'ACCEPT',
          doctorNotes: 'Confirmed previous cholecystectomy in 2021',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fact.verified).toBe(true);
      expect(res.body.data.fact.source).toBe('DOCTOR_VERIFIED');
    });

    it('should finalize session and promote verified facts to existing medical record model', async () => {
      const res = await request(app)
        .post(`/api/intake/doctor/sessions/${completedSession._id}/finalize`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ notes: 'Intake fully verified' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.promotedRecords.length).toBeGreaterThan(0);

      // Verify fact is updated
      const updatedFact = await ClinicalFact.findById(testFact._id);
      expect(updatedFact.promotedResourceType).toBe('Procedure');
      expect(updatedFact.promotedResourceId).toBeDefined();
    });
  });

  describe('6. Kiosk Device Administration & Analytics', () => {
    let createdKioskId;

    it('should register a new kiosk hardware terminal', async () => {
      const res = await request(app)
        .post('/api/kiosks/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Reception Kiosk Ground Floor',
          location: 'OPD Main Waiting Lobby',
          organizationId: organization._id,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deviceToken).toBeDefined();
      createdKioskId = res.body.data.kiosk._id;
    });

    it('should remotely disable kiosk', async () => {
      const res = await request(app)
        .post(`/api/kiosks/${createdKioskId}/disable`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Scheduled maintenance' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kiosk.status).toBe('DISABLED');
    });

    it('should return intake throughput analytics', async () => {
      const res = await request(app)
        .get('/api/intake/analytics')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.totalSessions).toBeGreaterThan(0);
    });
  });
});
