# HealthBridge Consent System Architecture

Consent is a core security primitive within HealthBridge. The platform operates on the premise that no doctor or healthcare provider may access patient data without explicit patient authorization.

---

## 1. Consent Lifecycle State Machine

```
               ┌───────────┐
               │  PENDING  │
               └─────┬─────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   ┌──────────────┐      ┌──────────────┐
   │   APPROVED   │      │   REJECTED   │
   └──────┬───────┘      └──────────────┘
          │
   ┌──────┴──────┐
   ▼             ▼
┌─────────┐ ┌─────────┐
│ REVOKED │ │ EXPIRED │
└─────────┘ └─────────┘
```

1. **PENDING**: Doctor requests access for a defined purpose, duration, and clinical scope.
2. **APPROVED**: Patient explicitly approves. An expiration timestamp (`expiresAt`) is recorded.
3. **REJECTED**: Patient denies access.
4. **REVOKED**: Patient cancels active access at any time. Revocation takes immediate effect.
5. **EXPIRED**: Access grant naturally lapses after `expiresAt`.

---

## 2. Granular Resource Scopes

Consents define explicit access boundaries across 10 resource categories:

- `conditions` (Diagnoses, ICD-10/SNOMED)
- `allergies` (Allergies & Intolerances)
- `medications` (Prescriptions & Active Meds)
- `procedures` (Surgeries, Arthroplasty, Biopsies)
- `observations` (Lab Values, Vitals, LOINC)
- `diagnosticReports` (Lab Panels, Histopathology)
- `imagingStudies` (X-Ray, CT, MRI)
- `documents` (PDF reports, discharge summaries)
- `encounters` (Hospital visits, IPD/OPD)
- `immunizations` (Vaccinations)

---

## 3. Break-Glass / Emergency Access Mode

In acute emergencies (e.g. unconscious trauma in ER), authenticated doctors can activate Break-Glass emergency access.
- Exposes only critical emergency information (Blood Group, Allergies, Active Meds, Major Conditions, Past Surgeries).
- Requires a mandatory clinical reason (min 10 chars).
- Creates an immutable `EMERGENCY_ACCESS` audit event BEFORE returning any data.
- Notifies the patient and is prominently flagged in their access log.
