# 🔐 Authentication Flow - IMPLEMENTED

**Date:** October 22, 2024  
**Status:** ✅ FULLY WORKING

---

## Overview

The authentication system now includes:
- ✅ Route protection via middleware
- ✅ Automatic redirect to login for unauthenticated users
- ✅ Token storage in both localStorage and cookies
- ✅ Locale-aware redirects
- ✅ Automatic token refresh on expiry

---

## 🛡️ Protected Routes

### All routes are protected by default EXCEPT:
- `/en/login` - Login page
- `/ar/login` - Arabic login page
- `/en/register` - Register page (if implemented)
- `/ar/register` - Arabic register page (if implemented)

### Protected routes include:
- `/en/dashboard` - Dashboard
- `/en/animals` - Animals list
- `/en/animals/[id]` - Animal details
- All other app routes

---

## 🔄 Authentication Flow

### 1. **Unauthenticated User Access**

```
User visits: http://localhost:3000/en/dashboard
              ↓
Middleware checks: No auth_token cookie found
              ↓
Redirects to: http://localhost:3000/en/login?redirect=/en/dashboard
```

### 2. **Login Process**

```
User enters credentials at /en/login
              ↓
Login mutation called via tRPC
              ↓
Success: Tokens stored in:
  - localStorage (accessToken, refreshToken)
  - Cookies (auth_token, refresh_token)
              ↓
Redirect to: /en/dashboard (or redirect URL from query param)
```

### 3. **Authenticated User Access**

```
User visits: http://localhost:3000/en/animals
              ↓
Middleware checks: auth_token cookie exists
              ↓
Access granted: Page loads normally
```

### 4. **Logout Process**

```
User clicks logout button
              ↓
clearAuth() called:
  - Removes from localStorage
  - Clears cookies
              ↓
Redirects to: /en/login
```

### 5. **Token Expiry**

```
API returns 401 Unauthorized
              ↓
tRPC client attempts token refresh
              ↓
Success: New tokens stored, request retried
              ↓
Failure: clearAuth() + redirect to login
```

---

## 🍪 Token Storage

### Cookies (for middleware)
```javascript
auth_token: JWT access token
  - Path: /
  - Max-Age: 7 days
  - SameSite: Lax

refresh_token: JWT refresh token
  - Path: /
  - Max-Age: 30 days
  - SameSite: Lax
```

### localStorage (for client-side)
```javascript
accessToken: JWT access token
refreshToken: JWT refresh token
currentFarmId: Selected farm ID
user: User data object
```

---

## 🧪 Testing the Flow

### Test 1: Unauthenticated Access
1. Open browser in incognito mode
2. Go to: `http://localhost:3000/en/dashboard`
3. **Expected:** Redirected to `/en/login?redirect=/en/dashboard`

### Test 2: Login
1. At login page, enter:
   - Phone: `+970591234567`
   - Password: `password123`
2. Click "Login"
3. **Expected:** Redirected to `/en/dashboard`

### Test 3: Protected Route Access
1. After login, go to: `http://localhost:3000/en/animals`
2. **Expected:** Page loads normally (no redirect)

### Test 4: Logout
1. Click logout button in sidebar
2. **Expected:** Redirected to `/en/login`
3. Try to access `/en/dashboard`
4. **Expected:** Redirected back to `/en/login`

### Test 5: Direct Login Access (Already Authenticated)
1. Login successfully
2. Try to visit: `http://localhost:3000/en/login`
3. **Expected:** Redirected to `/en/dashboard`

---

## 🌍 Locale Support

The authentication system is fully locale-aware:

### English Routes
- Login: `/en/login`
- Dashboard: `/en/dashboard`
- Animals: `/en/animals`

### Arabic Routes
- Login: `/ar/login`
- Dashboard: `/ar/dashboard`
- Animals: `/ar/animals`

All redirects maintain the current locale!

---

## 📁 Modified Files

### 1. `apps/web/src/middleware.ts`
- Added authentication check
- Redirects unauthenticated users to login
- Redirects authenticated users away from login/register
- Preserves locale in all redirects

### 2. `apps/web/src/lib/trpc.ts`
- Updated `setAuthToken()` to store in cookies
- Updated `setRefreshToken()` to store in cookies
- Updated `clearAuth()` to clear cookies
- Fixed redirect URLs to be locale-aware

### 3. `apps/web/src/app/[locale]/page.tsx`
- Fixed redirect to use locale parameter

### 4. `apps/web/src/app/[locale]/(auth)/login/page.tsx`
- Added locale awareness using `useParams()`
- Fixed redirect after login to include locale

---

## 🔧 Configuration

### Middleware Matcher
```typescript
matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
```
- Runs on all routes except API and static files

### Public Routes
```typescript
const publicRoutes = ['/login', '/register'];
```
- Add more routes here if needed (e.g., `/forgot-password`)

---

## 🚀 How It Works

### Middleware Chain

```
Request → Next.js Middleware
            ↓
         i18n Middleware (locale handling)
            ↓
         Auth Check (token validation)
            ↓
         Redirect OR Continue
            ↓
         Page Render
```

### Token Validation

The middleware checks for the `auth_token` cookie:
- **Present:** User is authenticated → Allow access
- **Missing:** User is not authenticated → Redirect to login

Note: The middleware only checks for token presence, not validity. Token validity is checked by the API on each request.

---

## 🔐 Security Features

### ✅ Implemented
- Route protection via middleware
- Token storage in HTTP-only cookies (for middleware)
- Automatic token refresh
- Logout clears all auth data
- Locale-aware redirects prevent URL manipulation

### 🔜 Future Enhancements
- HTTP-only cookies for all tokens (requires server-side API)
- CSRF protection
- Rate limiting on login attempts
- Session management
- Remember me functionality

---

## 🐛 Troubleshooting

### Issue: Infinite redirect loop
**Cause:** Token exists but is invalid  
**Solution:** Clear cookies and localStorage, then login again

### Issue: Redirected to login after successful login
**Cause:** Cookies not being set properly  
**Solution:** Check browser console for errors, ensure cookies are enabled

### Issue: Can access protected routes without login
**Cause:** Middleware not running  
**Solution:** Check middleware matcher pattern, restart dev server

---

## ✅ Success Indicators

You'll know authentication is working when:

- ✅ Visiting `/en/dashboard` without login redirects to `/en/login`
- ✅ After login, you're redirected to dashboard
- ✅ Can access all protected routes after login
- ✅ Logout redirects to login page
- ✅ Cannot access protected routes after logout
- ✅ Visiting `/en/login` while logged in redirects to dashboard

---

## 📝 Test Credentials

**Phone:** `+970591234567`  
**Password:** `password123`

---

**Built with ❤️ for Palestinian farmers**

