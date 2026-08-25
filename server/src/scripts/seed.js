/**
 * HealthBridge Demo Data Seed Script
 *
 * Creates fictional demo data for development and testing.
 * NEVER contains real medical information.
 *
 * Run with: npm run seed (from server directory)
 */

import { connectDB, disconnectDB } from '../config/database.js';
import { hashPassword } from '../security/passwordService.js';
import logger from '../config/logger.js';

// Models
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Practitioner from '../models/Practitioner.js';
import Organization from '../models/Organization.js';
import Encounter from '../models/Encounter.js';
import Condition from '../models/Condition.js';
import Allergy from '../models/Allergy.js';
import Medication from '../models/Medication.js';
import Procedure from '../models/Procedure.js';
import Observation from '../models/Observation.js';
import DiagnosticReport from '../models/DiagnosticReport.js';
import ImagingStudy from '../models/ImagingStudy.js';
import Immunization from '../models/Immunization.js';
import Consent from '../models/Consent.js';
import AuditEvent from '../models/AuditEvent.js';
import Notification from '../models/Notification.js';
import { fileURLToPath } from 'url';

export const seedData = async () => {
  logger.info('Starting database seed...');

  // ── Clear existing data ────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Practitioner.deleteMany({}),
    Organization.deleteMany({}),
    Encounter.deleteMany({}),
    Condition.deleteMany({}),
    Allergy.deleteMany({}),
    Medication.deleteMany({}),
    Procedure.deleteMany({}),
    Observation.deleteMany({}),
    DiagnosticReport.deleteMany({}),
    ImagingStudy.deleteMany({}),
    Immunization.deleteMany({}),
    Consent.deleteMany({}),
    AuditEvent.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  logger.info('Cleared existing data');

  const passwordHash = await hashPassword('Demo@1234');

  // ── Organizations ──────────────────────────────────────────────────────────
  const [apolloHospital, cityDiagnostics] = await Organization.insertMany([
    {
      name: 'Apollo Demo Hospital',
      type: 'HOSPITAL',
      registrationNumber: 'DEMO-HOSP-001',
      address: { line1: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034' },
      contactEmail: 'admin@apollodemo.example',
      contactPhone: '+914023456789',
      isVerified: true,
    },
    {
      name: 'City Diagnostics Centre',
      type: 'LAB',
      registrationNumber: 'DEMO-LAB-001',
      address: { line1: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
      contactEmail: 'admin@citydiag.example',
      contactPhone: '+911123456789',
      isVerified: true,
    },
  ]);
  logger.info('Organizations created');

  // ── System Admin ──────────────────────────────────────────────────────────
  const adminUser = await User.create({
    email: 'admin@healthbridge.example',
    passwordHash,
    role: 'SYSTEM_ADMIN',
    firstName: 'System',
    lastName: 'Admin',
    isVerified: true,
    isActive: true,
  });

  // ── Doctor Users ──────────────────────────────────────────────────────────
  const [drSharmaUser, drMehtaUser, drRaoUser] = await User.insertMany([
    {
      email: 'dr.sharma@apollodemo.example',
      passwordHash,
      role: 'DOCTOR',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+919876543210',
      isVerified: true,
      isActive: true,
    },
    {
      email: 'dr.mehta@apollodemo.example',
      passwordHash,
      role: 'DOCTOR',
      firstName: 'Rajesh',
      lastName: 'Mehta',
      phone: '+919876543211',
      isVerified: true,
      isActive: true,
    },
    {
      email: 'dr.rao@citydiag.example',
      passwordHash,
      role: 'DOCTOR',
      firstName: 'Sunita',
      lastName: 'Rao',
      phone: '+919876543212',
      isVerified: true,
      isActive: true,
    },
  ]);

  // ── Practitioners ─────────────────────────────────────────────────────────
  const [drSharma, drMehta, drRao] = await Practitioner.insertMany([
    {
      userId: drSharmaUser._id,
      organizationId: apolloHospital._id,
      specialization: 'General Surgery',
      licenseNumber: 'MCI-2019-12345',
      licenseBody: 'Medical Council of India',
      qualifications: ['MBBS', 'MS (General Surgery)'],
      isVerified: true,
    },
    {
      userId: drMehtaUser._id,
      organizationId: apolloHospital._id,
      specialization: 'Cardiology',
      licenseNumber: 'MCI-2015-67890',
      licenseBody: 'Medical Council of India',
      qualifications: ['MBBS', 'MD (Medicine)', 'DM (Cardiology)'],
      isVerified: true,
    },
    {
      userId: drRaoUser._id,
      organizationId: cityDiagnostics._id,
      specialization: 'Pathology',
      licenseNumber: 'MCI-2018-11111',
      licenseBody: 'Medical Council of India',
      qualifications: ['MBBS', 'MD (Pathology)'],
      isVerified: true,
    },
  ]);
  logger.info('Doctors created');

  // ── Patient Users ─────────────────────────────────────────────────────────
  const [arjunUser, priyaUser, rameshUser] = await User.insertMany([
    {
      email: 'arjun.kumar@example.com',
      passwordHash,
      role: 'PATIENT',
      firstName: 'Arjun',
      lastName: 'Kumar',
      phone: '+919123456780',
      isVerified: true,
      isActive: true,
    },
    {
      email: 'priya.patel@example.com',
      passwordHash,
      role: 'PATIENT',
      firstName: 'Priya',
      lastName: 'Patel',
      phone: '+919123456781',
      isVerified: true,
      isActive: true,
    },
    {
      email: 'ramesh.singh@example.com',
      passwordHash,
      role: 'PATIENT',
      firstName: 'Ramesh',
      lastName: 'Singh',
      phone: '+919123456782',
      isVerified: true,
      isActive: true,
    },
  ]);

  // ── Patient Profiles ──────────────────────────────────────────────────────
  const [arjun, priya, ramesh] = await Patient.insertMany([
    {
      userId: arjunUser._id,
      dateOfBirth: new Date('1988-04-15'),
      gender: 'male',
      bloodGroup: 'B+',
      height: 175,
      weight: 72,
      emergencyContact: { name: 'Sunita Kumar', relationship: 'Spouse', phone: '+919123456790' },
      address: { line1: '42 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
    },
    {
      userId: priyaUser._id,
      dateOfBirth: new Date('1995-08-22'),
      gender: 'female',
      bloodGroup: 'A+',
      height: 162,
      weight: 58,
      emergencyContact: { name: 'Suresh Patel', relationship: 'Father', phone: '+919123456791' },
      address: { line1: '15 Satellite Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
    },
    {
      userId: rameshUser._id,
      dateOfBirth: new Date('1970-12-03'),
      gender: 'male',
      bloodGroup: 'O+',
      height: 168,
      weight: 85,
      emergencyContact: { name: 'Kavita Singh', relationship: 'Spouse', phone: '+919123456792' },
      address: { line1: '7 Civil Lines', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
    },
  ]);
  logger.info('Patients created');

  // ── ARJUN's Medical History (2021–2026) ───────────────────────────────────

  // Appendectomy 2021
  const enc1 = await Encounter.create({
    patientId: arjun._id,
    practitionerId: drSharma._id,
    organizationId: apolloHospital._id,
    type: 'INPATIENT',
    status: 'finished',
    startDate: new Date('2021-07-10'),
    endDate: new Date('2021-07-14'),
    chiefComplaint: 'Acute abdominal pain, right lower quadrant',
    notes: 'Patient admitted with acute appendicitis. Underwent laparoscopic appendectomy.',
  });

  const appendectomyProcedure = await Procedure.create({
    patientId: arjun._id,
    encounterId: enc1._id,
    code: '80146002',
    display: 'Laparoscopic Appendectomy',
    system: 'SNOMED-CT',
    status: 'completed',
    performedDate: new Date('2021-07-11'),
    performedBy: drSharma._id,
    organizationId: apolloHospital._id,
    bodySite: 'Appendix',
    outcome: 'Successful. No complications.',
    notes: 'Laparoscopic approach. Specimen sent for histopathology.',
    isSurgery: true,
  });

  const appendicitisCondition = await Condition.create({
    patientId: arjun._id,
    encounterId: enc1._id,
    code: 'K35.80',
    display: 'Acute Appendicitis without abscess',
    system: 'ICD-10',
    clinicalStatus: 'resolved',
    verificationStatus: 'confirmed',
    onsetDate: new Date('2021-07-09'),
    abatementDate: new Date('2021-07-14'),
    recordedBy: drSharma._id,
    organizationId: apolloHospital._id,
  });

  // Blood work post surgery 2021
  const enc2 = await Encounter.create({
    patientId: arjun._id,
    practitionerId: drRao._id,
    organizationId: cityDiagnostics._id,
    type: 'LAB',
    status: 'finished',
    startDate: new Date('2021-07-12'),
    chiefComplaint: 'Post-operative blood work',
  });

  const [wbc, hgb, plt] = await Observation.insertMany([
    {
      patientId: arjun._id,
      encounterId: enc2._id,
      code: '6690-2',
      display: 'WBC Count',
      system: 'LOINC',
      value: 14.2,
      unit: '10^3/uL',
      referenceRange: { low: 4.5, high: 11.0 },
      interpretation: 'high',
      observedAt: new Date('2021-07-12'),
      recordedBy: drRao._id,
      organizationId: cityDiagnostics._id,
    },
    {
      patientId: arjun._id,
      encounterId: enc2._id,
      code: '718-7',
      display: 'Hemoglobin',
      system: 'LOINC',
      value: 13.1,
      unit: 'g/dL',
      referenceRange: { low: 13.5, high: 17.5 },
      interpretation: 'low',
      observedAt: new Date('2021-07-12'),
      recordedBy: drRao._id,
      organizationId: cityDiagnostics._id,
    },
    {
      patientId: arjun._id,
      encounterId: enc2._id,
      code: '777-3',
      display: 'Platelet Count',
      system: 'LOINC',
      value: 285,
      unit: '10^3/uL',
      referenceRange: { low: 150, high: 400 },
      interpretation: 'normal',
      observedAt: new Date('2021-07-12'),
      recordedBy: drRao._id,
      organizationId: cityDiagnostics._id,
    },
  ]);

  const report1 = await DiagnosticReport.create({
    patientId: arjun._id,
    encounterId: enc2._id,
    code: 'CBC',
    display: 'Complete Blood Count - Post-operative',
    status: 'final',
    effectiveDate: new Date('2021-07-12'),
    conclusion: 'Mild leukocytosis consistent with post-operative state. Mild anaemia.',
    results: [wbc._id, hgb._id, plt._id],
    organizationId: cityDiagnostics._id,
  });

  // Annual checkup 2023
  const enc3 = await Encounter.create({
    patientId: arjun._id,
    practitionerId: drMehta._id,
    organizationId: apolloHospital._id,
    type: 'OUTPATIENT',
    status: 'finished',
    startDate: new Date('2023-03-15'),
    chiefComplaint: 'Annual health checkup',
    notes: 'Routine annual examination. Patient in good health.',
  });

  const [glucose, cholesterol, bp] = await Observation.insertMany([
    {
      patientId: arjun._id,
      encounterId: enc3._id,
      code: '2345-7',
      display: 'Blood Glucose (Fasting)',
      system: 'LOINC',
      value: 98,
      unit: 'mg/dL',
      referenceRange: { low: 70, high: 100 },
      interpretation: 'normal',
      observedAt: new Date('2023-03-15'),
      recordedBy: drMehta._id,
      organizationId: apolloHospital._id,
    },
    {
      patientId: arjun._id,
      encounterId: enc3._id,
      code: '2093-3',
      display: 'Total Cholesterol',
      system: 'LOINC',
      value: 195,
      unit: 'mg/dL',
      referenceRange: { high: 200 },
      referenceRange: { low: 0, high: 200, text: 'Desirable: <200' },
      interpretation: 'normal',
      observedAt: new Date('2023-03-15'),
      recordedBy: drMehta._id,
      organizationId: apolloHospital._id,
    },
    {
      patientId: arjun._id,
      encounterId: enc3._id,
      code: '55284-4',
      display: 'Blood Pressure',
      system: 'LOINC',
      value: '120/78',
      unit: 'mmHg',
      referenceRange: { text: 'Normal: <120/80' },
      interpretation: 'normal',
      observedAt: new Date('2023-03-15'),
      recordedBy: drMehta._id,
      organizationId: apolloHospital._id,
    },
  ]);

  const report2 = await DiagnosticReport.create({
    patientId: arjun._id,
    encounterId: enc3._id,
    code: 'HEALTH-CHECKUP',
    display: 'Annual Health Checkup Panel',
    status: 'final',
    effectiveDate: new Date('2023-03-15'),
    conclusion: 'All parameters within normal range. Continue healthy lifestyle.',
    results: [glucose._id, cholesterol._id, bp._id],
    organizationId: apolloHospital._id,
  });

  // Hypertension 2024
  const enc4 = await Encounter.create({
    patientId: arjun._id,
    practitionerId: drMehta._id,
    organizationId: apolloHospital._id,
    type: 'OUTPATIENT',
    status: 'finished',
    startDate: new Date('2024-06-20'),
    chiefComplaint: 'Elevated blood pressure readings at home',
  });

  await Condition.create({
    patientId: arjun._id,
    encounterId: enc4._id,
    code: 'I10',
    display: 'Essential Hypertension',
    system: 'ICD-10',
    clinicalStatus: 'active',
    severity: 'mild',
    onsetDate: new Date('2024-06-20'),
    recordedBy: drMehta._id,
    organizationId: apolloHospital._id,
  });

  await Medication.create({
    patientId: arjun._id,
    encounterId: enc4._id,
    medicationCode: '1000048',
    medicationDisplay: 'Amlodipine 5mg',
    status: 'active',
    dosage: { text: '1 tablet daily', value: 5, unit: 'mg', route: 'Oral' },
    frequency: 'Once daily',
    startDate: new Date('2024-06-20'),
    prescribedBy: drMehta._id,
    organizationId: apolloHospital._id,
  });

  // ── ARJUN's Allergies ────────────────────────────────────────────────────
  await Allergy.insertMany([
    {
      patientId: arjun._id,
      code: 'Z88.0',
      display: 'Penicillin allergy',
      criticality: 'high',
      type: 'allergy',
      category: ['medication'],
      reaction: [{ description: 'Urticaria and angioedema', severity: 'severe' }],
      verificationStatus: 'confirmed',
      recordedBy: drSharma._id,
      organizationId: apolloHospital._id,
    },
    {
      patientId: arjun._id,
      display: 'Peanut allergy',
      criticality: 'high',
      type: 'allergy',
      category: ['food'],
      reaction: [{ description: 'Anaphylaxis', severity: 'severe' }],
      verificationStatus: 'confirmed',
    },
  ]);

  // ── ARJUN's Immunizations ────────────────────────────────────────────────
  await Immunization.insertMany([
    {
      patientId: arjun._id,
      vaccineDisplay: 'COVID-19 Vaccine (Covaxin)',
      status: 'completed',
      occurrenceDate: new Date('2021-04-15'),
      doseNumber: 1,
      seriesDoses: 2,
      manufacturer: 'Bharat Biotech',
      organizationId: apolloHospital._id,
    },
    {
      patientId: arjun._id,
      vaccineDisplay: 'COVID-19 Vaccine (Covaxin)',
      status: 'completed',
      occurrenceDate: new Date('2021-05-13'),
      doseNumber: 2,
      seriesDoses: 2,
      manufacturer: 'Bharat Biotech',
      organizationId: apolloHospital._id,
    },
    {
      patientId: arjun._id,
      vaccineDisplay: 'Influenza Vaccine',
      status: 'completed',
      occurrenceDate: new Date('2023-10-01'),
      doseNumber: 1,
      organizationId: apolloHospital._id,
    },
  ]);

  // ── PRIYA's Medical History ───────────────────────────────────────────────

  const enc5 = await Encounter.create({
    patientId: priya._id,
    practitionerId: drMehta._id,
    organizationId: apolloHospital._id,
    type: 'OUTPATIENT',
    status: 'finished',
    startDate: new Date('2024-01-10'),
    chiefComplaint: 'Palpitations and fatigue',
  });

  await Condition.create({
    patientId: priya._id,
    encounterId: enc5._id,
    code: 'E06.3',
    display: 'Autoimmune Thyroiditis (Hashimoto\'s)',
    system: 'ICD-10',
    clinicalStatus: 'active',
    severity: 'mild',
    onsetDate: new Date('2024-01-10'),
    recordedBy: drMehta._id,
    organizationId: apolloHospital._id,
  });

  await Medication.create({
    patientId: priya._id,
    encounterId: enc5._id,
    medicationDisplay: 'Levothyroxine 50mcg',
    status: 'active',
    dosage: { text: '1 tablet daily (empty stomach)', value: 50, unit: 'mcg', route: 'Oral' },
    frequency: 'Once daily',
    startDate: new Date('2024-01-15'),
    prescribedBy: drMehta._id,
    organizationId: apolloHospital._id,
  });

  const [tsh, t4] = await Observation.insertMany([
    {
      patientId: priya._id,
      encounterId: enc5._id,
      code: '3016-3',
      display: 'TSH (Thyroid Stimulating Hormone)',
      system: 'LOINC',
      value: 8.2,
      unit: 'mIU/L',
      referenceRange: { low: 0.4, high: 4.0 },
      interpretation: 'high',
      observedAt: new Date('2024-01-10'),
      recordedBy: drRao._id,
      organizationId: cityDiagnostics._id,
    },
    {
      patientId: priya._id,
      encounterId: enc5._id,
      code: '3026-2',
      display: 'Free T4',
      system: 'LOINC',
      value: 0.7,
      unit: 'ng/dL',
      referenceRange: { low: 0.8, high: 1.8 },
      interpretation: 'low',
      observedAt: new Date('2024-01-10'),
      recordedBy: drRao._id,
      organizationId: cityDiagnostics._id,
    },
  ]);

  await DiagnosticReport.create({
    patientId: priya._id,
    code: 'THYROID-PANEL',
    display: 'Thyroid Function Tests',
    status: 'final',
    effectiveDate: new Date('2024-01-10'),
    conclusion: 'Elevated TSH with low free T4 — consistent with hypothyroidism.',
    results: [tsh._id, t4._id],
    organizationId: cityDiagnostics._id,
  });

  await Allergy.create({
    patientId: priya._id,
    display: 'Sulfa drugs (Sulfonamides)',
    criticality: 'high',
    type: 'allergy',
    category: ['medication'],
    reaction: [{ description: 'Skin rash and itching', severity: 'moderate' }],
    verificationStatus: 'confirmed',
  });

  // ── RAMESH's Medical History (Complex — older patient) ─────────────────────

  // Diabetes diagnosed 2018
  const enc6 = await Encounter.create({
    patientId: ramesh._id,
    practitionerId: drMehta._id,
    organizationId: apolloHospital._id,
    type: 'OUTPATIENT',
    status: 'finished',
    startDate: new Date('2018-03-20'),
    chiefComplaint: 'Increased thirst, frequent urination, fatigue',
  });

  await Condition.insertMany([
    {
      patientId: ramesh._id,
      encounterId: enc6._id,
      code: 'E11',
      display: 'Type 2 Diabetes Mellitus',
      system: 'ICD-10',
      clinicalStatus: 'active',
      severity: 'moderate',
      onsetDate: new Date('2018-03-20'),
      recordedBy: drMehta._id,
      organizationId: apolloHospital._id,
    },
    {
      patientId: ramesh._id,
      code: 'I10',
      display: 'Essential Hypertension',
      system: 'ICD-10',
      clinicalStatus: 'active',
      severity: 'moderate',
      onsetDate: new Date('2019-01-15'),
      recordedBy: drMehta._id,
      organizationId: apolloHospital._id,
    },
    {
      patientId: ramesh._id,
      code: 'E78.5',
      display: 'Hyperlipidaemia',
      system: 'ICD-10',
      clinicalStatus: 'active',
      severity: 'mild',
      onsetDate: new Date('2019-01-15'),
      recordedBy: drMehta._id,
      organizationId: apolloHospital._id,
    },
  ]);

  await Medication.insertMany([
    {
      patientId: ramesh._id,
      medicationDisplay: 'Metformin 500mg',
      status: 'active',
      dosage: { text: '1 tablet twice daily with meals', value: 500, unit: 'mg', route: 'Oral' },
      frequency: 'Twice daily',
      startDate: new Date('2018-03-25'),
      prescribedBy: drMehta._id,
      organizationId: apolloHospital._id,
    },
    {
      patientId: ramesh._id,
      medicationDisplay: 'Losartan 50mg',
      status: 'active',
      dosage: { text: '1 tablet once daily', value: 50, unit: 'mg', route: 'Oral' },
      frequency: 'Once daily',
      startDate: new Date('2019-02-01'),
      prescribedBy: drMehta._id,
      organizationId: apolloHospital._id,
    },
    {
      patientId: ramesh._id,
      medicationDisplay: 'Atorvastatin 10mg',
      status: 'active',
      dosage: { text: '1 tablet at night', value: 10, unit: 'mg', route: 'Oral' },
      frequency: 'Once daily at bedtime',
      startDate: new Date('2019-02-01'),
      prescribedBy: drMehta._id,
      organizationId: apolloHospital._id,
    },
    {
      patientId: ramesh._id,
      medicationDisplay: 'Aspirin 75mg',
      status: 'active',
      dosage: { text: '1 tablet daily', value: 75, unit: 'mg', route: 'Oral' },
      frequency: 'Once daily',
      startDate: new Date('2020-06-10'),
      prescribedBy: drMehta._id,
      organizationId: apolloHospital._id,
    },
  ]);

  // Knee replacement surgery 2022
  const enc7 = await Encounter.create({
    patientId: ramesh._id,
    practitionerId: drSharma._id,
    organizationId: apolloHospital._id,
    type: 'INPATIENT',
    status: 'finished',
    startDate: new Date('2022-09-05'),
    endDate: new Date('2022-09-12'),
    chiefComplaint: 'Right knee osteoarthritis — planned total knee replacement',
  });

  await Procedure.create({
    patientId: ramesh._id,
    encounterId: enc7._id,
    code: '609588000',
    display: 'Total Right Knee Arthroplasty',
    system: 'SNOMED-CT',
    status: 'completed',
    performedDate: new Date('2022-09-06'),
    performedBy: drSharma._id,
    organizationId: apolloHospital._id,
    bodySite: 'Right knee joint',
    outcome: 'Successful. Patient discharged with physiotherapy plan.',
    isSurgery: true,
  });

  await Allergy.create({
    patientId: ramesh._id,
    display: 'Ibuprofen / NSAIDs',
    criticality: 'high',
    type: 'intolerance',
    category: ['medication'],
    reaction: [{ description: 'Gastric bleeding', severity: 'severe' }],
    verificationStatus: 'confirmed',
  });

  // Recent lab results 2025
  const [hba1c, bun, creatinine] = await Observation.insertMany([
    {
      patientId: ramesh._id,
      code: '4548-4',
      display: 'HbA1c (Glycated Haemoglobin)',
      system: 'LOINC',
      value: 7.8,
      unit: '%',
      referenceRange: { text: 'Target for diabetics: <7%' },
      interpretation: 'high',
      observedAt: new Date('2025-11-10'),
      recordedBy: drRao._id,
      organizationId: cityDiagnostics._id,
    },
    {
      patientId: ramesh._id,
      code: '3094-0',
      display: 'BUN (Blood Urea Nitrogen)',
      system: 'LOINC',
      value: 22,
      unit: 'mg/dL',
      referenceRange: { low: 7, high: 20 },
      interpretation: 'high',
      observedAt: new Date('2025-11-10'),
      recordedBy: drRao._id,
      organizationId: cityDiagnostics._id,
    },
    {
      patientId: ramesh._id,
      code: '2160-0',
      display: 'Serum Creatinine',
      system: 'LOINC',
      value: 1.3,
      unit: 'mg/dL',
      referenceRange: { low: 0.7, high: 1.2 },
      interpretation: 'high',
      observedAt: new Date('2025-11-10'),
      recordedBy: drRao._id,
      organizationId: cityDiagnostics._id,
    },
  ]);

  await DiagnosticReport.create({
    patientId: ramesh._id,
    code: 'DIABETIC-PANEL',
    display: 'Diabetic Monitoring Panel',
    status: 'final',
    effectiveDate: new Date('2025-11-10'),
    conclusion: 'HbA1c above target. Mild renal impairment noted. Review medication and diet.',
    results: [hba1c._id, bun._id, creatinine._id],
    organizationId: cityDiagnostics._id,
  });

  // Chest X-ray 2024
  await ImagingStudy.create({
    patientId: ramesh._id,
    modality: 'X-Ray',
    bodyPart: 'Chest',
    studyDate: new Date('2024-08-15'),
    description: 'Chest X-Ray PA View',
    findings: 'No active consolidation. Mild cardiomegaly noted.',
    impression: 'Mild cardiomegaly. Clinical correlation advised.',
    organizationId: apolloHospital._id,
  });

  logger.info('Medical records created');

  // ── Consent Scenarios ─────────────────────────────────────────────────────

  // Scenario 1: APPROVED consent — Dr. Sharma accessing Arjun's records
  const approvedConsent = await Consent.create({
    patientId: arjun._id,
    requestingPractitionerId: drSharma._id,
    requestingOrganizationId: apolloHospital._id,
    purpose: 'Clinical treatment — follow-up after appendectomy',
    purposeCode: 'TREAT',
    scope: ['conditions', 'allergies', 'medications', 'procedures', 'observations', 'diagnosticReports', 'encounters'],
    status: 'APPROVED',
    requestedAt: new Date('2026-07-01'),
    approvedAt: new Date('2026-07-01'),
    expiresAt: new Date('2026-09-30'), // still valid
    notifiedPatient: true,
  });

  // Scenario 2: PENDING consent — Dr. Mehta requesting Priya's records
  const pendingConsent = await Consent.create({
    patientId: priya._id,
    requestingPractitionerId: drMehta._id,
    requestingOrganizationId: apolloHospital._id,
    purpose: 'Follow-up for thyroid condition monitoring',
    purposeCode: 'TREAT',
    scope: ['conditions', 'medications', 'observations', 'diagnosticReports'],
    status: 'PENDING',
    requestedAt: new Date('2026-08-20'),
    notifiedPatient: true,
  });

  // Scenario 3: EXPIRED consent — Dr. Mehta had access to Ramesh (expired)
  const expiredConsent = await Consent.create({
    patientId: ramesh._id,
    requestingPractitionerId: drMehta._id,
    requestingOrganizationId: apolloHospital._id,
    purpose: 'Pre-operative assessment',
    purposeCode: 'TREAT',
    scope: ['conditions', 'allergies', 'medications'],
    status: 'APPROVED',
    requestedAt: new Date('2022-08-01'),
    approvedAt: new Date('2022-08-02'),
    expiresAt: new Date('2022-09-01'), // expired
    notifiedPatient: true,
  });

  // Scenario 4: REVOKED consent
  const revokedConsent = await Consent.create({
    patientId: arjun._id,
    requestingPractitionerId: drRao._id,
    requestingOrganizationId: cityDiagnostics._id,
    purpose: 'Lab result review',
    purposeCode: 'TREAT',
    scope: ['observations', 'diagnosticReports'],
    status: 'REVOKED',
    requestedAt: new Date('2025-01-10'),
    approvedAt: new Date('2025-01-10'),
    revokedAt: new Date('2025-02-01'),
    revocationReason: 'Patient no longer requires services from this provider',
    notifiedPatient: true,
  });

  logger.info('Consent scenarios created');

  // ── Notifications ─────────────────────────────────────────────────────────
  await Notification.create({
    userId: priyaUser._id,
    type: 'CONSENT_REQUEST',
    title: 'New Access Request from Dr. Rajesh Mehta',
    message: 'Dr. Rajesh Mehta (Apollo Demo Hospital) has requested access to your medical records for: Follow-up for thyroid condition monitoring',
    relatedResourceType: 'Consent',
    relatedResourceId: pendingConsent._id,
    read: false,
  });

  // ── Emergency Access Audit ────────────────────────────────────────────────
  await AuditEvent.create({
    action: 'EMERGENCY_ACCESS',
    actorId: drSharmaUser._id,
    actorRole: 'DOCTOR',
    patientId: ramesh._id,
    organizationId: apolloHospital._id,
    resourceType: 'Patient',
    resourceId: ramesh._id,
    purpose: 'ETREAT',
    ipAddress: '10.0.1.45',
    userAgent: 'HealthBridge-Doctor-App/2.1.0',
    emergencyFlag: true,
    emergencyReason: 'Patient brought to ER unconscious. No prior consent. Emergency treatment required.',
    metadata: { accessType: 'break-glass', er: true },
  });

  logger.info('Emergency access audit scenario created');

  // ── Summary ───────────────────────────────────────────────────────────────
  logger.info('='.repeat(60));
  logger.info('SEED COMPLETE — Demo Credentials (password: Demo@1234)');
  logger.info('='.repeat(60));
  logger.info('SYSTEM_ADMIN: admin@healthbridge.example');
  logger.info('DOCTOR: dr.sharma@apollodemo.example (General Surgery, Apollo)');
  logger.info('DOCTOR: dr.mehta@apollodemo.example (Cardiology, Apollo)');
  logger.info('DOCTOR: dr.rao@citydiag.example (Pathology, City Diagnostics)');
  logger.info('PATIENT: arjun.kumar@example.com (Appendectomy, Hypertension)');
  logger.info('PATIENT: priya.patel@example.com (Thyroid condition)');
  logger.info('PATIENT: ramesh.singh@example.com (Diabetes, Knee replacement)');
  logger.info('='.repeat(60));
  logger.info('Consent scenarios:');
  logger.info(`  APPROVED: ${approvedConsent._id} (Dr. Sharma → Arjun)`);
  logger.info(`  PENDING:  ${pendingConsent._id} (Dr. Mehta → Priya)`);
  logger.info(`  EXPIRED:  ${expiredConsent._id} (Dr. Mehta → Ramesh)`);
  logger.info(`  REVOKED:  ${revokedConsent._id} (Dr. Rao → Arjun)`);
  logger.info('='.repeat(60));
};

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  const run = async () => {
    await connectDB();
    await seedData();
    await disconnectDB();
  };
  run().catch((err) => {
    logger.error('Seed failed', { err });
    process.exit(1);
  });
}

