# Backend Setup Guide - Get Your API Working! 🚀

**Current Status:** ❌ Backend NOT working (database not configured)

---

## 📋 What You Need

To get the backend working, you need:

1. ✅ PostgreSQL installed
2. ✅ Database created
3. ✅ Environment variables configured
4. ✅ Database migrations run
5. ✅ (Optional) Test data seeded

---

## 🚀 Quick Setup (5 Steps)

### **Step 1: Install PostgreSQL**

If you don't have PostgreSQL installed:

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer (use default port 5432)
3. Remember the password you set for `postgres` user

**Or use Docker:**
```bash
docker run --name farmy-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

---

### **Step 2: Create Database**

Open PowerShell or Command Prompt:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE farmy;

# Exit
\q
```

**Or if using pgAdmin:**
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `farmy`
4. Click Save

---

### **Step 3: Create .env File**

Create a `.env` file in the **root** of your project:

```bash
# In the farmy folder (root)
# Create .env file
```

**Add this content to `.env`:**

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmy?schema=public"

# JWT Secrets (change these to random strings!)
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars-here-change-me"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars-here-change-me"
JWT_ACCESS_EXPIRES_IN="30m"
JWT_REFRESH_EXPIRES_IN="30d"

# Node Environment
NODE_ENV="development"
```

**⚠️ Important:** 
- Replace `postgres:postgres` with your actual PostgreSQL username:password
- Change the JWT secrets to random strings (at least 32 characters)

---

### **Step 4: Run Database Migrations**

This creates all the tables in your database:

```bash
# Generate Prisma Client
pnpm db:generate

# Run migrations (creates tables)
pnpm db:migrate
```

**What this does:**
- Creates 30+ tables (users, farms, animals, etc.)
- Sets up relationships
- Creates indexes
- Prepares database for use

**Expected output:**
```
✓ Generated Prisma Client
✓ Applied 2 migrations
✓ Database is ready
```

---

### **Step 5: Seed Test Data (Optional)**

Add test user and farm data:

```bash
cd packages/db
pnpm db:seed
```

**What this creates:**
- Test user: `+970591234567` / password: `password123`
- Test farm: "Test Farm"
- Sample animals: R001 (ram), E001 (ewe), E002 (ewe), L001 (lamb)

---

## ✅ Verify Backend is Working

### **1. Check Database Connection**

```bash
# Open Prisma Studio (database GUI)
pnpm db:studio
```

This opens http://localhost:5555 where you can see your tables and data.

### **2. Test API Endpoint**

Start your dev server:
```bash
pnpm dev
```

Then visit: http://localhost:3000/api/trpc

**Expected:** Should show tRPC info (not a 500 error)

### **3. Test Login**

1. Go to: http://localhost:3000/en/login
2. Enter:
   - Phone: `+970591234567`
   - Password: `password123`
3. Click Login

**Expected:** Should redirect to dashboard (if seeded data exists)

---

## 🔍 Troubleshooting

### ❌ "Can't reach database server"

**Problem:** PostgreSQL not running or wrong connection string

**Fix:**
```bash
# Check if PostgreSQL is running
# Windows: Open Services, look for "postgresql"

# Or check with psql
psql -U postgres -d farmy

# If connection works, check your DATABASE_URL in .env
```

### ❌ "Environment variable not found: DATABASE_URL"

**Problem:** .env file not in the right place or not loaded

**Fix:**
- Make sure `.env` is in the **root** folder (not in apps/web)
- Restart your dev server
- Check `.env` has `DATABASE_URL="..."`

### ❌ "Prisma schema not found"

**Problem:** Need to generate Prisma client

**Fix:**
```bash
pnpm db:generate
```

### ❌ "Table doesn't exist"

**Problem:** Migrations not run

**Fix:**
```bash
pnpm db:migrate
```

### ❌ "Invalid phone or password"

**Problem:** No test data in database

**Fix:**
```bash
cd packages/db
pnpm db:seed
```

---

## 📊 What Tables Were Created?

After migrations, you'll have these tables:

### **Identity & Access**
- `users` - User accounts
- `refresh_tokens` - JWT refresh tokens
- `farms` - Farms
- `farm_members` - Farm membership
- `super_admins` - Super admin users

### **Animals**
- `animals` - All animals
- `breeding_cycles` - Breeding records
- `breeding_events` - Breeding events (INS1, INS2, CK1, etc.)

### **Health**
- `health_events` - Health issues
- `treatments` - Treatment plans
- `doses` - Individual doses
- `withdrawal_tracks` - Milk/meat withdrawal tracking

### **Weight & Feed**
- `weights` - Weight measurements
- `feed_plans` - Feeding schedules
- `feed_usage` - Feed consumption
- `lamb_feedings` - Lamb feeding records

### **Milk & Sales**
- `milk_yields` - Daily milk production
- `milk_sales` - Milk sales
- `animal_sales` - Animal sales

### **Inventory**
- `inventory_items` - Stock items
- `inventory_batches` - Purchase batches
- `inventory_transactions` - Usage/purchases
- `suppliers` - Supplier info

### **Insights & Notifications**
- `action_events` - Farm actions
- `metric_snapshots` - Daily metrics
- `insight_cards` - Generated insights
- `reminders` - Task reminders
- `notification_inbox` - User notifications
- `device_tokens` - Push notification tokens

### **System**
- `tombstones` - Soft deletes
- `audit_logs` - Activity logs
- `attachments` - File uploads

**Total: 30+ tables** 🎉

---

## 🎯 What Works After Setup

Once backend is configured, these features work:

### ✅ **Authentication**
- Register new users
- Login with phone + password
- JWT token management
- Automatic token refresh
- Logout

### ✅ **Dashboard**
- View real animal count
- View breeding cycles
- View health events
- View sales data

### ✅ **Animals**
- Add new animals
- View animals list
- Search animals by tag/RFID
- Filter by type/status
- View animal details
- Edit animal info
- Delete animals (soft delete)

### ✅ **All API Endpoints**
- 100+ tRPC endpoints ready
- Type-safe API calls
- Automatic validation
- Error handling

---

## 📝 Environment Variables Reference

**Required:**
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
JWT_ACCESS_SECRET="min-32-chars"
JWT_REFRESH_SECRET="min-32-chars"
```

**Optional:**
```env
JWT_ACCESS_EXPIRES_IN="30m"
JWT_REFRESH_EXPIRES_IN="30d"
NODE_ENV="development"
LOG_LEVEL="debug"
```

**For Production (later):**
```env
STORAGE_ENDPOINT="https://..."
STORAGE_BUCKET="farmy-uploads"
FCM_PROJECT_ID="firebase-project"
REDIS_URL="redis://..."
```

---

## 🔐 Security Notes

### **JWT Secrets**
- Must be at least 32 characters
- Use random strings
- Never commit to git
- Different for access and refresh tokens

**Generate secure secrets:**
```bash
# In Node.js console
require('crypto').randomBytes(32).toString('hex')
```

### **Database Password**
- Use strong password in production
- Don't use default `postgres` password
- Consider using connection pooling

---

## 🚀 Next Steps After Setup

Once backend is working:

1. **Test all features:**
   - Login/logout
   - Add animals
   - View dashboard
   - Search/filter

2. **Explore Prisma Studio:**
   - View all tables
   - Add/edit data
   - Understand relationships

3. **Build more features:**
   - Add animal forms
   - Breeding management
   - Health tracking
   - Reports

4. **Deploy to production:**
   - Set up production database
   - Configure environment variables
   - Deploy to Vercel/Railway/etc.

---

## 📚 Useful Commands

```bash
# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema without migration
pnpm db:studio        # Open Prisma Studio GUI
pnpm db:seed          # Seed test data

# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm type-check       # Check TypeScript
pnpm lint             # Lint code

# Packages
cd packages/db        # Go to database package
cd apps/web           # Go to web app
```

---

## ✅ Checklist

Before testing, make sure:

- [ ] PostgreSQL is installed and running
- [ ] Database `farmy` is created
- [ ] `.env` file exists in root folder
- [ ] `DATABASE_URL` is correct in `.env`
- [ ] JWT secrets are set in `.env`
- [ ] `pnpm db:generate` completed successfully
- [ ] `pnpm db:migrate` completed successfully
- [ ] (Optional) `pnpm db:seed` completed successfully
- [ ] Dev server starts without errors
- [ ] Can access http://localhost:3000

---

## 🎉 Success!

If all steps completed, your backend is **WORKING**! 

You now have:
- ✅ Database with 30+ tables
- ✅ 100+ API endpoints
- ✅ Type-safe tRPC client
- ✅ Authentication system
- ✅ Test data (if seeded)

**Ready to build features!** 🚀




