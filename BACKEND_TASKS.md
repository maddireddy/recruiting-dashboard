# Backend Tasks for Recruiting Dashboard Frontend

This document lists backend endpoints and behaviors needed to fully support the frontend features implemented in this repo. It includes priorities, expected request/response payloads, and notes where the frontend makes assumptions.

## High priority

1. Email Templates
- GET /api/emails/templates
  - Response: 200 OK
  - Body: [ { id, tenantId, templateName, subject, body, htmlBody?, templateType, variables?: string[], isActive, createdAt, updatedAt } ]

- GET /api/emails/templates/:id
  - Response: 200 OK
  - Body: { id, tenantId, templateName, subject, body, htmlBody?, templateType, variables?: string[], isActive, createdAt, updatedAt }

- POST /api/emails/templates
  - Request body: { templateName, subject, body, templateType, variables?: string[], isActive }
  - Response: 201 Created
  - Body: created template

- PUT /api/emails/templates/:id
  - Request body: partial template fields
  - Response: 200 OK
  - Body: updated template

- DELETE /api/emails/templates/:id
  - Response: 204 No Content

2. Send Email / Template
- POST /api/emails/send
  - Request body: { to: string, subject: string, body: string }
  - Response: 200 OK / 202 Accepted

- POST /api/emails/send-template
  - Request body: { to: string, templateName: string, variables: Record<string,string> }
  - Response: 200 OK / 202 Accepted

3. Email Logs & Stats
- GET /api/emails/logs?page=0&size=20
  - Response: 200 OK
  - Body: { content: [ { id, tenantId, fromEmail, toEmail, ccEmail?, bccEmail?, subject, body, htmlBody?, templateUsed?, status, provider?, messageId?, errorMessage?, sentAt?, createdAt } ], totalElements, totalPages }

- GET /api/emails/stats
  - Response: 200 OK
  - Body: { sent: number, failed: number, pending: number }

Notes: Logs should include templateUsed when a template was used. The frontend will attempt to retry sending using the template name (without variables) if templateUsed is present.

4. Documents (upload/download)
- POST /api/documents (multipart/form-data)
  - Request: file field + metadata (entityType, entityId, documentType, tags[])
  - Response: 201 Created
  - Body: saved Document metadata { id, originalFileName, fileType, fileSize, documentType, entityType, entityId, tags, createdAt }

- GET /api/documents/entity/:entityType/:entityId
  - Response: 200 OK
  - Body: [ Document ]

- GET /api/documents/:id
  - Response: 200 OK
  - Body: Document metadata

- GET /api/documents/download/:id?token=... OR with Authorization header
  - Response: 200 OK
  - Headers: Content-Type, Content-Disposition (filename) or X-Download-Filename
  - Body: binary stream

- DELETE /api/documents/:id
  - Response: 204 No Content

Notes: The frontend calls `/documents/download/:id?token=...` and expects blob response and filename header. Provide CORS headers for cross-origin access in dev.

5. Reports & Exports
- GET /api/reports
  - Response: 200 OK with paginated list

- GET /api/reports/:id/execute
  - Response: 200 OK with execution data (array of rows)

- GET /api/reports/:id/export-csv?token=...
  - Response: 200 OK
  - Headers: Content-Type: text/csv; Content-Disposition: attachment; filename="report.csv"
  - Body: CSV stream

- GET /api/reports/exports/candidates?token=...
- GET /api/reports/exports/jobs?token=...
- GET /api/reports/exports/submissions?token=...
  - Response: Redirect or direct CSV stream. Frontend opens these URLs to trigger download.

## Medium priority

1. Auth integration
- Ensure frontend token keys exist in localStorage (used keys: `token`, `accessToken`, `tenantId` in various places).
- Provide consistent Authorization header support (Bearer token) and/or `?token=` query param as fallback.

2. Email configuration
- GET /api/emails/config
- PUT /api/emails/config

3. Report executions history
- GET /api/reports/:id/executions

## Low priority / Enhancements

- Support returning sample variable mappings for templates: GET /api/emails/templates/:name/variables -> { variables: Record<string,string> }
  - This helps the preview and test-send features to use realistic sample values.

- Support POST /api/emails/send-template-bulk for multi-recipient templated sends.

- Webhook or callback for delivery status updates (optional): POST /api/emails/logs/webhook

## Integration notes & assumptions
- Frontend currently uses two localStorage keys for token: `token` (used by reportService) and `accessToken` (used by documentService). Align the backend auth layer and the frontend code to use one consistent key (recommendation: `accessToken` and Authorization: Bearer <token> header).
- Document download endpoint must accept either query token param or Authorization header. It should supply `Content-Disposition` or `X-Download-Filename` so the frontend can pick a filename.
- For template resend from logs, logs may not contain the original variables; the frontend will retry with empty variables when missing. If possible, store variables used during send in logs for reliable retries.

## Priority timeline suggestion
1. Email send & logs endpoints (essential) — 1 week
2. Templates CRUD (if not already present) — 3 days
3. Document download/upload endpoints & CORS — 2 days
4. Reports CSV export endpoints — 2 days
5. Extra: sample variables & webhook — 1 week

If you want, I can open a PR with these backend contract docs in `BACKEND_TASKS.md` and prepare example Express route stubs that conform to the frontend's expectations.
