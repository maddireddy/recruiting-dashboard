# RecruitPro Backend API

Backend API server for the RecruitPro SaaS recruitment platform.

## Features

- ✅ Organization onboarding API (6 endpoints)
- ✅ Employee management API (CRUD + provisioning)
- ✅ Auto-generated employee IDs
- ✅ Email provisioning service
- ✅ Domain verification
- ✅ Badge generation (PDF/PNG)
- ✅ File upload handling
- ✅ JWT authentication
- ✅ Role-based permissions

## Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **QRCode** - Badge QR codes

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### Onboarding

- `POST /api/v1/onboarding/start` - Start onboarding
- `POST /api/v1/onboarding/company-profile` - Save company profile
- `POST /api/v1/onboarding/subscription` - Save subscription plan
- `POST /api/v1/onboarding/domain` - Configure domain
- `POST /api/v1/onboarding/domain/verify` - Verify custom domain
- `POST /api/v1/onboarding/branding` - Save branding (with file uploads)
- `POST /api/v1/onboarding/email-config` - Configure email
- `POST /api/v1/onboarding/complete` - Complete onboarding
- `GET /api/v1/onboarding/status` - Get onboarding status

### Employees

- `GET /api/v1/employees` - List employees (with filters)
- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees/:id` - Get employee details
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee
- `POST /api/v1/employees/:id/provision-email` - Provision email
- `GET /api/v1/employees/:id/badge` - Generate badge
- `POST /api/v1/employees/:id/reset-password` - Reset password
- `GET /api/v1/employees/next-id` - Get next employee ID
- `POST /api/v1/employees/bulk-import` - Bulk import
- `GET /api/v1/employees/export` - Export employees

## Database Models

### Organization

```javascript
{
  name, slug, industry, companySize,
  headquarters: { street, city, state, zip, country },
  onboarding: { status, currentStep, completedSteps },
  subscription: { plan, status, billingEmail },
  domain: { type, subdomain, customDomain, verified },
  branding: { logo, favicon, colors, fonts },
  email: { domain, smtpProvider, smtpConfig },
  limits, usage, settings
}
```

### Employee

```javascript
{
  employeeId, // Auto-generated (EMP-0001, EMP-0002...)
  personalInfo: { firstName, lastName, email, phone, photo },
  employment: { title, department, joinDate, status },
  emailAccount: { email, provisioned, emailFormat },
  badge: { generated, qrCode, pdfUrl, pngUrl },
  access: { role, permissions },
  organizationId
}
```

### Department

```javascript
{
  name, code, description,
  parent, // For hierarchy
  head, // Department head employee
  organizationId
}
```

## Services

### Email Service

Handles email provisioning and sending:
- Support for SendGrid, AWS SES, Mailgun, Custom SMTP
- Employee email provisioning
- Password reset emails
- DNS record generation (SPF, DKIM, DMARC)

### Domain Service

Handles domain verification and SSL:
- DNS record verification
- SSL certificate provisioning
- Subdomain validation

### Badge Service

Generates employee badges:
- PDF and PNG formats
- QR code generation
- Multiple templates
- Company branding integration

### File Upload Service

Handles file uploads:
- Local storage (development)
- AWS S3 integration (production ready)
- File validation
- Image processing

## Authentication

All API routes require JWT authentication:

```bash
Authorization: Bearer <your-jwt-token>
```

Payload includes:
```javascript
{
  userId,
  organizationId,
  role,
  permissions
}
```

## Permissions

Role-based access control:

- `employees.view` - View employees
- `employees.create` - Create employees
- `employees.edit` - Edit employees
- `employees.delete` - Delete employees
- `employees.export` - Export employee data

## Error Handling

Standard error response:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (dev mode only)"
}
```

## Testing

```bash
# Run tests
npm test

# Seed database with test data
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure MongoDB Atlas
4. Setup AWS S3 for file uploads
5. Configure email provider (SendGrid recommended)
6. Enable HTTPS
7. Setup monitoring (Sentry, DataDog)

## Integration with Frontend

Update frontend API base URL:

```javascript
// src/services/api.ts
const API_BASE_URL = 'http://localhost:3001/api/v1';
```

## License

MIT
