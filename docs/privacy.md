# HealthBridge Privacy & Data Protection Architecture

> **Notice**: HealthBridge is designed according to privacy-by-design principles for sensitive digital health data.

---

## 1. Patient Sovereignty & Data Ownership

HealthBridge is a **patient-controlled** health intelligence platform:
- Patients hold full authority over who accesses their health records.
- Records originate from diverse clinical organizations (hospitals, labs, imaging centers, clinics) and are organized into a lifelong timeline.
- No healthcare practitioner or organization can access any patient's records without an active, explicit consent granted by that patient.

---

## 2. Consent State & Data Isolation

- Access grants are time-bound (with strict `expiresAt` validation on every query).
- Access grants are granularly scoped (e.g. only `allergies` and `medications`, or all 10 clinical resource types).
- Revocation is **instantaneous** — upon revocation, subsequent API access requests fail immediately.

---

## 3. Storage Privacy & Document Handling

- Medical records and scanned documents (PDFs, DICOMs, lab reports) are stored in private object storage using random UUID keys.
- Documents are streamed only through authenticated, consent-checked API endpoints.
- Storage keys and raw OCR text layers are hidden from public API responses (`select: false`).

---

## 4. Immutable Auditability

- Every data view, document download, access request, and emergency access is permanently logged in the `AuditEvent` collection.
- Audit events are write-once and can never be modified or erased by any user or administrator.
- Patients have complete transparency into their own access history directly from their portal.
