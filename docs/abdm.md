# HealthBridge ABDM Integration Strategy

> **Important**: HealthBridge does not currently implement live ABDM (Ayushman Bharat Digital Mission) integration. No ABDM APIs have been fabricated or mocked as real. This document describes the integration architecture and what is needed for real integration.

---

## Current Status

| Component | Status |
|-----------|--------|
| ABDM API client | Not implemented |
| ABHA ID storage | ✅ Optional field in Patient model |
| FHIR data model | ✅ FHIR R4-compatible schema |
| Consent model | ✅ ABDM-compatible consent concepts |
| ABDMProvider interface | Placeholder (interface definition only) |
| MockABDMAdapter | To be built in Phase 14 |

---

## Integration Architecture

The system uses a `HealthcareDataProvider` abstraction:

```
HealthcareDataProvider (interface)
├── LocalDatabaseProvider    ← Current implementation
├── MockFHIRProvider         ← Testing/demo
└── ABDMProvider             ← Placeholder for real integration
```

ABDM integration is a plug-in adapter. The core system never imports ABDM-specific code.

---

## What Real ABDM Integration Requires

1. **ABDM sandbox credentials** — Register at https://sandbox.abdm.gov.in
2. **ABHA enrollment API** — Create and link ABHA IDs
3. **Health Information Exchange (HIE)** — FHIR-based record exchange
4. **Consent Manager integration** — ABDM consent artifact flow
5. **Health Locker integration** — Personal Health Record (PHR) app linking
6. **M1/M2 milestones** — ABDM compliance certification process

---

## References

- ABDM Developer Portal: https://abdm.gov.in/
- ABDM Sandbox: https://sandbox.abdm.gov.in/
- ABDM Integration APIs: https://sandbox.abdm.gov.in/swagger/index.html
- ABHA: https://abha.abdm.gov.in/

---

> [!WARNING]
> Do not claim "ABDM integrated" or "ABDM certified" without completing the official ABDM integration and certification process. The ABDM ecosystem has strict technical and compliance requirements.
