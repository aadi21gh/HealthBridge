# HealthBridge HL7 FHIR Interoperability Architecture

HealthBridge implements HL7 FHIR Release 4 (R4) resource mapping and standard search bundle responses.

---

## 1. Supported FHIR R4 Resources

| HealthBridge Entity | FHIR Resource Type | Profile URL |
|---------------------|--------------------|-------------|
| Patient | `Patient` | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient` |
| Condition | `Condition` | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition` |
| Allergy | `AllergyIntolerance` | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/AllergyIntolerance` |
| Medication | `MedicationRequest` | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest` |
| Procedure | `Procedure` | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Procedure` |
| Observation | `Observation` | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation` |
| DiagnosticReport | `DiagnosticReport` | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReportLab` |
| ImagingStudy | `ImagingStudy` | Standard FHIR R4 ImagingStudy |
| Encounter | `Encounter` | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter` |

---

## 2. Terminology & Coding Systems

HealthBridge leverages international clinical standard vocabularies:

- **LOINC**: Laboratory observations, vitals, test codes
- **SNOMED-CT**: Clinical findings, surgical procedures, anatomical sites
- **ICD-10**: Diagnostic classifications & chronic conditions
- **UCUM**: Units of measure for clinical observations

---

## 3. Data Provider Abstraction

HealthBridge uses a pluggable `HealthcareDataProvider` interface. Data can be sourced from:
1. `LocalDatabaseProvider`: MongoDB native clinical repository
2. `MockFHIRProvider`: External simulated FHIR R4 server
3. `ABDMProvider`: Future Ayushman Bharat Digital Mission HIE adapter
