# HealthBridge 🏥

**Unified, Patient-Controlled Longitudinal Health Record & Smart Clinical Intake Platform**

HealthBridge is a modern, FHIR-compliant digital health platform built for the Indian healthcare ecosystem (aligned with the Ayushman Bharat Digital Mission — ABDM). It connects patients, doctors, and hospital kiosks into a single, secure, consent-driven network.

---

## 🌟 Table of Contents
1. [How HealthBridge Works](#-how-healthbridge-works)
2. [Core Portals & Features](#-core-portals--features)
   - [1. Patient Portal](#1-patient-portal-patient)
   - [2. Doctor Portal](#2-doctor-portal-doctor)
   - [3. Touchscreen Kiosk Intake](#3-touchscreen-kiosk-intake-kiosk)
   - [4. Hospital Fleet Administration](#4-hospital-fleet-administration-adminkiosks)
3. [Quick Start & Setup](#-quick-start--setup)
4. [Demo Accounts & Test Credentials](#-demo-accounts--test-credentials)
5. [Step-by-Step User Journeys](#-step-by-step-user-journeys)
6. [Security & Privacy Architecture](#-security--privacy-architecture)
7. [Technology Stack](#-technology-stack)

---

## 💡 How HealthBridge Works

In traditional healthcare, a patient’s medical history is fragmented across different hospitals, diagnostic labs, and paper files. When visiting a new doctor, patients often have to re-explain their entire history or carry thick paper folders.

**HealthBridge solves this through 3 core concepts:**

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Patient Kiosk  │       │ Patient Consent │       │  Doctor Chart   │
│  (OPD Waiting)  │ ────► │  (ABDM Engine)  │ ────► │  (Consultation) │
└─────────────────┘       └─────────────────┘       └─────────────────┘
  • Voice/Touch Intake       • Explicit Patient Grant   • Longitudinal History
  • Scanned Docs & OCR       • Scope & Time Limits      • Verified Intake Facts
  • Red Flag Detection       • Immutable Audit Ledger   • Allergy Safety Alerts
```

1. **Patient-Owned Data**: Every diagnosis, prescription, lab test, and document belongs to the patient.
2. **Consent-First Access**: Doctors cannot view a patient's records without explicit permission. Patients choose what records to share (e.g. only lab reports, or full history) and for how long.
3. **Smart Pre-Consultation Intake**: Patients can complete a guided digital intake at an OPD kiosk before seeing the doctor. The system extracts symptoms, screens for urgent red flags, digitizes physical prescriptions with OCR, and presents a structured clinical briefing to the doctor.

---

## 🖥️ Core Portals & Features

### 1. Patient Portal (`/patient/*`)
* **Clinical Dashboard**: Overview of recent hospital visits, vital stats, active emergency contacts, and active allergy alerts.
* **Longitudinal Medical Timeline**: A unified, chronological history of encounters, diagnoses, lab investigations, surgeries, and immunizations across all visiting hospitals.
* **Records Vault**: Downloadable and viewable diagnostic reports, lab observations, and discharge summaries.
* **Consent Manager**: Real-time permission dashboard. Approve incoming requests from doctors, customize access scopes, or revoke permissions with one click.
* **Allergies & Intolerances**: Critical safety ledger highlighting drug, food, and environmental allergies with severity indicators.
* **Medications & Prescriptions**: Active prescriptions with dosage schedules, frequency, refills, and prescribing physician details.
* **Access History (Audit Log)**: An immutable ledger showing every time a doctor or clinic accessed your records, including timestamps and emergency break-glass alerts.
* **Profile & Settings**: Manage ABHA ID, personal demographics, emergency contacts, and notification preferences.

---

### 2. Doctor Portal (`/doctor/*`)
* **Clinical Workspace**: View assigned patients, pending intake briefings, and active consent approvals.
* **Patient Clinical Chart (`/doctor/patients/:id`)**: Comprehensive medical chart featuring:
  - Top identity strip & critical allergy safety banner
  - Vital statistics and blood group
  - Filterable medical history (Encounters, Conditions, Labs, Medications, Surgeries, Immunizations)
* **Patient Search & Consent Request (`/doctor/search`)**:
  - Search patients by ABHA ID, Mobile Number, or Name.
  - Select granular access scopes (e.g. *Consultation Records*, *Diagnostic Reports*, *Prescriptions*).
  - Define access duration (e.g. 1 hour, 24 hours, 7 days).
  - Submit request directly to the patient's portal.
* **Emergency "Break-Glass" Access**: In life-threatening emergencies where a patient is unconscious, doctors can bypass standard consent by providing mandatory clinical justification. This immediately triggers an immutable high-priority audit event visible to the patient.
* **Digital Intake Briefing (`/doctor/intake/:sessionId`)**:
  - Review pre-consultation information gathered at the kiosk.
  - Interactive fact verification: Doctors can verify, edit, or reject AI-extracted symptoms and history.
  - Urgent red flag alerts (e.g. severe chest pain, acute dyspnea) flagged before the patient walks in.
  - Document viewer with OCR text extraction for physical papers scanned by the patient.

---

### 3. Touchscreen Kiosk Intake (`/kiosk`)
* **Multilingual Support**: Available in English, Hindi (हिंदी), and Marathi (मराठी).
* **Patient Identification**: Lookup via Mobile Number, ABHA ID, Name, or Walk-in registration.
* **Multilingual Privacy Notice**: Plain-language consent explained to the patient before intake begins.
* **Touch & Voice Interactive Questions**:
  - Conversational symptoms intake with text-to-speech (voice audio) and speech-to-text (microphone input).
  - Large touch buttons (Yes/No, symptom checklists, and 1–10 pain severity scale).
  - AYUSH and Modern Medicine intake pathways.
* **Document Scanner & OCR**: Patients can scan and upload previous lab reports or physical prescription slips.
* **Privacy Auto-Purge**: Kiosk automatically clears local session memory and returns to the home screen after a countdown timer.

---

### 4. Hospital Fleet Administration (`/admin/kiosks`)
* **Terminal Registry**: Track status (`ONLINE`, `DISABLED`), software version, and heartbeat pings for all hospital kiosk units.
* **Throughput Analytics**: Monitor total sessions, average intake duration, red-flag frequency, and doctor fact-verification rates.
* **Device Provisioning**: Generate secure hardware tokens for newly installed kiosk units.

---

## 🚀 Quick Start & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB or free MongoDB Atlas cluster

### 1. Installation
Clone the repository and install all dependencies:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
*(Default settings automatically use in-memory database fallback if MongoDB Atlas is not configured).*

### 3. Start Application
```bash
# Run both Backend API (Port 5000) and Frontend Client (Port 5173)
npm run dev
```

* **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
* **Kiosk Terminal**: [http://localhost:5173/kiosk](http://localhost:5173/kiosk)

---

## 🌐 Deploy to the Cloud (Live Website)

HealthBridge is ready for 1-click cloud deployment. See the full [Deployment Guide (DEPLOYMENT.md)](./DEPLOYMENT.md) for step-by-step instructions.

* **Render (1-Click Blueprint)**: Uses `render.yaml` to deploy both the React frontend and Express backend together on the free tier with zero CORS configuration.
* **Railway / Fly.io / VPS**: Full support for Docker Compose or standard Node.js runtime.
* **Vercel**: Pre-configured `vercel.json` for frontend CDN hosting.

---

## 🔑 Demo Accounts & Test Credentials

All demo accounts use the standard password: **`Demo@1234`**

| Portal Role | Demo Name | Email / Login | Password | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Arjun Kumar | `arjun.kumar@example.com` | `Demo@1234` | Patient with surgical history, allergies & active consent |
| **Patient** | Priya Patel | `priya.patel@example.com` | `Demo@1234` | Patient with thyroid condition & pending consent request |
| **Patient** | Ramesh Singh | `ramesh.singh@example.com` | `Demo@1234` | Patient with diabetes & knee replacement history |
| **Doctor** | Dr. Rajesh Sharma | `dr.sharma@apollodemo.example` | `Demo@1234` | General Surgeon with approved access to Arjun Kumar |
| **Doctor** | Dr. Ananya Mehta | `dr.mehta@apollodemo.example` | `Demo@1234` | Cardiologist with pending consent request |
| **Doctor** | Dr. Vikram Rao | `dr.rao@citydiag.example` | `Demo@1234` | Pathologist with revoked consent |
| **Admin** | Hospital Admin | `admin@healthbridge.example` | `Demo@1234` | System administrator managing kiosk devices |

> 💡 **Tip:** On the [Sign In Page](http://localhost:5173/login), click **Sign In →** on any demo card to log in with 1-click!

---

## 🧪 Step-by-Step User Journeys

### Journey A: The Consent Flow (Patient & Doctor)
1. **Log in as Doctor** (`dr.mehta@apollodemo.example`).
2. Go to **Patient Search** (`/doctor/search`) and search for `Priya Patel` or `9876543211`.
3. Click **Request Access**, select required medical scopes (e.g. *Conditions*, *Diagnostic Reports*), set validity for *24 Hours*, and submit.
4. **Log out** and **Log in as Patient** (`priya.patel@example.com`).
5. Navigate to **Consent Manager** (`/patient/consents`).
6. View the incoming request from *Dr. Ananya Mehta* and click **Approve Consent**.
7. Log back in as **Dr. Mehta** — Priya Patel's full clinical record is now unlocked in your **Authorized Patients** directory!

---

### Journey B: The Kiosk OPD Intake Flow
1. Open the **Kiosk Interface** at [http://localhost:5173/kiosk](http://localhost:5173/kiosk).
2. Choose your preferred language (English, हिंदी, or मराठी).
3. Select **Modern Medicine Consultation** and click **Start Check-in**.
4. Identify as **Arjun Kumar** using mobile number `9876543210`.
5. Review and accept the privacy notice.
6. Answer symptom questions (use touch or microphone voice dictation).
7. Select pain severity and attach previous medical documents if desired.
8. Submit the intake session and note the confirmation.
9. Log in as **Dr. Sharma** (`dr.sharma@apollodemo.example`) and click on the newly generated **Intake Briefing** to review and verify the patient's facts!

---

### Journey C: Emergency "Break-Glass" Access
1. Log in as **Dr. Sharma** (`dr.sharma@apollodemo.example`).
2. Navigate to **Patient Search** and search for `Ramesh Singh` (whose standard consent is expired).
3. Select **Emergency Break-Glass Access**.
4. Enter clinical emergency justification (e.g. *"Acute Trauma ER — Patient unconscious"*).
5. The clinical chart opens immediately for life-saving care.
6. Log in as **Ramesh Singh** (`ramesh.singh@example.com`) and navigate to **Access History** (`/patient/access-history`) — the emergency access event is recorded in the permanent audit ledger with full clinical reason and timestamp.

---

## 🔒 Security & Privacy Architecture

* **Authentication**: Stateless JWT access tokens (15-min expiry) paired with secure HTTP-only refresh tokens (7-day sliding window).
* **Password Hashing**: Cryptographically hardened Argon2id algorithm with memory cost protections.
* **Zero-Knowledge Consent Gate**: Database access layer enforces consent verification *before* executing medical queries.
* **Audit Trail**: Every read, write, consent grant, revocation, and emergency access is stored in an immutable audit ledger (`AuditEvent` collection).
* **Kiosk Terminal Sandboxing**: Ephemeral session storage automatically flushed after intake completion or session timeout.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 with Vite |
| **Styling & Design System** | Tailwind CSS (Clinical Blue `#2563eb`, neutral surfaces, clinical semantics) |
| **Icons & Visuals** | Lucide React |
| **State & API Cache** | TanStack React Query v5 |
| **Routing** | React Router v6 |
| **Backend Runtime** | Node.js (ES Modules) & Express |
| **Database** | MongoDB with Mongoose ODM (with MongoMemoryServer dev fallback) |
| **Security & Auth** | Argon2, JSON Web Tokens (JWT), Helmet, CORS, Express-Rate-Limit |
| **Healthcare Standard** | HL7 FHIR R4 concepts & ABDM consent specifications |

---

## 📄 License & Healthcare Notice

HealthBridge is built as a reference clinical software platform. In accordance with healthcare data protection principles, all demo records contain fictional data for demonstration purposes. Before production clinical deployment, systems must undergo independent statutory and ABDM compliance audits.

