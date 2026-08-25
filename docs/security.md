# HealthBridge Security Architecture

> **Disclaimer**: This document describes the security architecture implemented in HealthBridge. It does not constitute a formal security audit or compliance certification. Independent security review is required before production deployment in a clinical setting.

---

## Authentication

### Password Hashing
- **Algorithm**: Argon2id (memory-hard, recommended by OWASP)
- **Parameters**: 64 MB memory, 3 iterations, 4 parallelism threads
- **Rationale**: Significantly more resistant to GPU/ASIC attacks than bcrypt

### JWT Tokens
- **Access token**: Short-lived (15 minutes), stored in JavaScript memory only
- **Refresh token**: Long-lived (7 days), stored as SHA-256 hash in database
- **Cookie**: Refresh token delivered via `httpOnly + SameSite=Strict` cookie
- **Rotation**: Refresh tokens are rotated on every use (old token invalidated)

### Account Security
- Account lockout after 5 consecutive failed login attempts (15 min)
- Rate limiting: 10 auth attempts per IP per 15 minutes
- Timing-safe password comparison (prevents timing attacks on missing accounts)

---

## Authorization Model

Every medical-record API request passes through a 4-layer middleware stack:

```
authenticate()         → Verify JWT, load user, check isActive
→ requireRole(roles[]) → RBAC check
→ consentGate(scope)   → For doctor routes: verify active approved consent
                          + scope coverage + expiry
→ auditLog(action)     → Write immutable audit event
→ controller()
```

### Consent Gate
The consent gate is the most critical security control. It verifies:
1. An approved consent exists for this doctor ↔ patient pair
2. The consent has not expired (checked at request time)
3. The requested resource type is within the approved scope
4. The consent has not been revoked

Revocation takes effect **immediately** — the next API request after revocation is denied.

---

## Audit Logging

- Every medical data access generates an immutable `AuditEvent` document
- Audit events are **write-once** — no update or delete operations in the application layer
- Fields logged: WHO, WHAT, WHEN, PATIENT, ORG, RESOURCE, ACTION, PURPOSE, CONSENT, IP, USER-AGENT, EMERGENCY FLAG
- Patients can view their complete audit trail via the UI
- Emergency access events are specially flagged and highlighted

---

## Transport Security

- All endpoints require HTTPS in production (enforced by deployment configuration)
- `helmet.js` security headers on all responses
- CORS restricted to configured client origin only
- Request size limits (10 MB body, configurable file size limits)

---

## Data Protection

- `passwordHash` field: `select: false` — never returned in queries
- `refreshTokens.tokenHash` field: `select: false`
- `storageKey` (S3 key): `select: false` — never exposed in API responses
- `extractedText` (OCR): `select: false` — accessed only when explicitly needed
- Medical documents stored in private object storage (not publicly accessible)

---

## Input Validation

- Joi schema validation on all request bodies
- `express-mongo-sanitize` to prevent MongoDB operator injection
- TypeScript-style enum validation on all model fields

---

## Areas Requiring Review Before Production

> [!CAUTION]
> The following areas require additional review/implementation before production:

1. **HTTPS enforcement** — configure at reverse proxy/load balancer level
2. **MongoDB authentication** — configure database user credentials
3. **Object storage access control** — verify S3/MinIO bucket policies
4. **Secrets rotation** — establish a key rotation procedure
5. **Dependency audit** — run `npm audit --fix` and review results
6. **Penetration testing** — engage a healthcare security firm
7. **Rate limiting** — tune limits based on actual traffic patterns
8. **Session management** — consider Redis for distributed token invalidation
