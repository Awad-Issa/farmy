# Login Context Fix

**Date:** October 20, 2024  
**Status:** ✅ FIXED

---

## Issue

Login was failing with "Invalid phone or password" error even with correct credentials.

---

## Root Cause

The tRPC context was using the wrong adapter type:
- Using: `CreateNextContextOptions` (for Next.js Pages API)
- Should use: `FetchCreateContextFnOptions` (for Next.js App Router with fetch adapter)

This caused the context to not properly receive the request object, making it impossible to authenticate.

---

## Solution

Updated `packages/api/src/trpc.ts`:

**Before:**
```typescript
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';

export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req } = opts;
  const authHeader = req.headers.authorization; // ❌ Wrong API
  const farmId = typeof req.headers['x-farm-id'] === 'string' ? ... // ❌ Wrong API
}
```

**After:**
```typescript
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const { req } = opts;
  const authHeader = req.headers.get('authorization'); // ✅ Correct Fetch API
  const farmId = req.headers.get('x-farm-id'); // ✅ Correct Fetch API
}
```

---

## What Changed

1. **Import**: Changed from `CreateNextContextOptions` to `FetchCreateContextFnOptions`
2. **Headers API**: Changed from `req.headers.authorization` to `req.headers.get('authorization')`
3. **Farm ID**: Changed from `req.headers['x-farm-id']` to `req.headers.get('x-farm-id')`

---

## Files Modified

- ✅ `packages/api/src/trpc.ts` - Fixed context creation

---

## Testing

After restarting the server, login should work:

1. Go to: http://localhost:3000/en/login
2. Phone: `+970591234567`
3. Password: `password123`
4. Click Login → Should redirect to dashboard!

---

## Why This Happened

Next.js App Router uses the Fetch API (Web Standards), while the old Pages Router used Node.js request objects. The context was still using the old API.

---

**Login should now work!** 🎉




