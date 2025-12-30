# MongoDB Seed Data

This directory contains seed data for testing the recruiting platform with different subscription tiers.

## Overview

The seed data creates 4 organizations with different subscription plans:

### 1. **Freemium Tier**
- **Organization:** Freemium Recruiting Inc.
- **Tenant ID:** `tenant_freemium_001`
- **Price:** $0/month
- **Limits:**
  - 1 user
  - 50 candidates
  - 5 jobs
  - 3 clients
  - 1GB storage
- **Features:**
  - ❌ Advanced Reports
  - ❌ Workflows
  - ❌ AI Features
  - ❌ Internal Chat
  - ❌ Timesheets
  - ❌ Invoicing

### 2. **Starter Tier**
- **Organization:** Starter Staffing Solutions
- **Tenant ID:** `tenant_starter_001`
- **Price:** $49/month
- **Limits:**
  - 5 users
  - 500 candidates
  - 50 jobs
  - 25 clients
  - 10GB storage
- **Features:**
  - ✅ Advanced Reports
  - ❌ Workflows
  - ❌ AI Features
  - ✅ Internal Chat
  - ✅ Timesheets
  - ❌ Invoicing

### 3. **Pro Tier**
- **Organization:** Pro Talent Agency
- **Tenant ID:** `tenant_pro_001`
- **Price:** $149/month
- **Limits:**
  - 20 users
  - Unlimited candidates
  - Unlimited jobs
  - Unlimited clients
  - 100GB storage
- **Features:**
  - ✅ Advanced Reports
  - ✅ Workflows
  - ✅ AI Features
  - ✅ Internal Chat
  - ✅ Timesheets
  - ✅ Invoicing

### 4. **Enterprise Tier**
- **Organization:** Enterprise Recruiting Group
- **Tenant ID:** `tenant_enterprise_001`
- **Price:** $499/month
- **Limits:**
  - Unlimited users
  - Unlimited everything
  - 1TB storage
- **Features:**
  - ✅ All Pro features
  - ✅ Custom Branding
  - ✅ API Access
  - ✅ SSO Integration
  - ✅ Dedicated Support

## Test Credentials

All test users have the same password: **`Test@1234`**

| Tier | Email | Features |
|------|-------|----------|
| Freemium | `admin@freemium-recruiting.com` | Basic only, 1 user limit |
| Starter | `admin@starter-staffing.com` | Advanced reports, chat, timesheets |
| Pro | `admin@pro-talent.com` | All features including AI and workflows |
| Enterprise | `admin@enterprise-group.com` | All features + SSO, API, custom branding |

## Usage

### Method 1: Using npm script (Recommended)

```bash
# Make sure you're in the project root
npm run seed:db
```

### Method 2: Using Node.js directly

```bash
node mongodb-seed/load-seed-data.js
```

### Method 3: Using mongosh

```bash
mongosh mongodb://localhost:27017/recruiting_platform < mongodb-seed/seed-data.js
```

## Environment Variables

You can customize the MongoDB connection using environment variables:

```bash
# MongoDB connection URL
export MONGODB_URL="mongodb://localhost:27017"

# Database name
export MONGODB_DATABASE="recruiting_platform"

# Then run the seed script
npm run seed:db
```

## Data Created

The seed script creates:

- **4 Organizations** (1 per tier)
- **~40 Users** (distributed across tiers based on limits)
- **160 Candidates** (10 Freemium, 50 Pro, 100 Enterprise)
- **11 Clients** (1 Pro, 10 Enterprise)

## Testing Feature Gating

Use this seed data to test feature gating based on subscription tiers:

### Example 1: User Limit Testing
1. Login as `admin@freemium-recruiting.com`
2. Try to invite a second user → Should fail (limit: 1 user)

### Example 2: Workflow Access
1. Login as `admin@starter-staffing.com`
2. Navigate to Workflow Management → Should show "Upgrade to Pro" message
3. Login as `admin@pro-talent.com`
4. Navigate to Workflow Management → Should work fully

### Example 3: Candidate Limit
1. Login as `admin@freemium-recruiting.com`
2. Currently has 10 candidates
3. Try to add more than 50 → Should show limit warning

### Example 4: AI Features
1. Login as `admin@starter-staffing.com`
2. AI features (resume parsing, recommendations) → Should be disabled
3. Login as `admin@pro-talent.com`
4. AI features → Should be fully enabled

## Database Schema

### Organizations Collection
```javascript
{
  _id: ObjectId,
  name: String,
  tenantId: String,
  subscription: {
    name: String,
    tier: String,
    price: Number,
    billingCycle: String,
    features: {
      maxUsers: Number,
      maxCandidates: Number,
      canAccessWorkflows: Boolean,
      // ... more features
    }
  },
  subscriptionStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  email: String,
  passwordHash: String,
  name: String,
  role: String,
  tenantId: String,
  organizationId: ObjectId,
  isActive: Boolean,
  permissions: Array,
  createdAt: Date,
  updatedAt: Date
}
```

## Notes

- The script clears existing data before loading. Comment out the `deleteMany()` calls if you want to preserve existing data.
- Password hash is bcrypt with 10 rounds: `Test@1234`
- All dates are relative to the script execution time
- Tenant IDs follow the pattern: `tenant_{tier}_{number}`
- User IDs follow the pattern: `user_{tier}_{role}`

## Troubleshooting

### MongoDB not running
```bash
# Start MongoDB service
# On macOS:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# On Windows:
net start MongoDB
```

### Connection refused
Make sure MongoDB is running and accessible at the configured URL (default: `mongodb://localhost:27017`)

### Permission denied
Ensure your MongoDB user has write permissions to the database.

## Integration Testing Workflow

1. **Load seed data:**
   ```bash
   npm run seed:db
   ```

2. **Start backend:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```

4. **Test each tier:**
   - Login with each tier's admin account
   - Verify feature availability matches subscription
   - Test hitting limits (users, candidates, etc.)
   - Verify billing/subscription display

5. **Test feature gating:**
   - Try accessing premium features from lower tiers
   - Verify proper "Upgrade" messaging
   - Test workflows installation (Pro+ only)
   - Test AI features (Pro+ only)

## Next Steps

After loading seed data:
1. Implement backend subscription checking middleware
2. Add frontend feature gating components
3. Create upgrade/downgrade flows
4. Implement usage tracking and limit enforcement
5. Add billing integration (Stripe/Paddle)
