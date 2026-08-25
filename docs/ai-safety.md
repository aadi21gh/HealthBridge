# HealthBridge AI Health Intelligence & Safety Architecture

> **Guiding Principle**: AI is an administrative and investigative assistant, **NOT** a doctor.

---

## 1. Safety Guardrails & Prohibitions

The HealthBridge AI engine is strictly constrained:

- ❌ **NO Autonomous Diagnosis**: The system will never attempt to diagnose medical conditions from symptoms or lab values.
- ❌ **NO Prescribing / Dosing**: The system will never recommend or modify pharmaceutical treatments.
- ❌ **NO Hallucination / Inference**: If relevant clinical records are missing or outside authorized scope, the AI explicitly states: *"I could not find this information in the authorized records."*
- ❌ **NO Record Mutation**: AI outputs never alter existing medical records.

---

## 2. Retrieval-Grounded Architecture (RAG with Consent Gate)

```
User Query
    │
    ▼
Consent & Scope Gate  ────────► Checks Doctor ↔ Patient active consent
    │
    ▼
Authorized Records ONLY
    │
    ▼
Context Construction
    │
    ▼
AI Engine + Guardrails
    │
    ▼
Structured Response + Explicit Source Citations (Hospital, Date, Record Type)
```

1. **Authorization Pre-filter**: Only records matching the approved consent scope can enter the AI context.
2. **Source Grounding**: Every answer is paired with references back to specific encounters, surgical reports, or diagnostic documents.
3. **Mandatory Disclaimer**: Every response carries a clear clinical disclaimer.
