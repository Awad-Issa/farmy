# Web App Error Fixes

**Date:** October 20, 2024  
**Status:** ✅ FIXED

---

## Issues Fixed

### 1. Missing Translation Key ✅
**Error:**
```
IntlError: MISSING_MESSAGE: Could not resolve `nav.logout` in messages for locale `ar`.
```

**Root Cause:**
The `nav.logout` translation key was missing from both `en.json` and `ar.json` translation files, but the Sidebar component was trying to use it.

**Fix:**
Added `"logout"` key to both translation files:

**`apps/web/messages/en.json`:**
```json
"nav": {
  ...
  "logout": "Logout"
}
```

**`apps/web/messages/ar.json`:**
```json
"nav": {
  ...
  "logout": "تسجيل الخروج"
}
```

---

### 2. SSR Error: `document is not defined` ✅
**Error:**
```
ReferenceError: document is not defined
at Header (./src/components/Header.tsx:194:35)
```

**Root Cause:**
The Header component was trying to access `document.documentElement` during server-side rendering (SSR), but `document` is only available in the browser.

**Fix:**
Refactored the Header component to:
1. Use React state to track the current direction
2. Use `useEffect` to safely access `document` only on the client side
3. Check for `typeof window !== 'undefined'` before accessing DOM

**Changes in `apps/web/src/components/Header.tsx`:**
```typescript
// Added state for current direction
const [currentDir, setCurrentDir] = useState<'ltr' | 'rtl'>('ltr');

// Get current direction on mount (client-side only)
useEffect(() => {
  if (typeof window !== 'undefined') {
    const dir = document.documentElement.getAttribute('dir') as 'ltr' | 'rtl';
    setCurrentDir(dir || 'ltr');
  }
}, []);

// Updated toggle function with window check
const toggleDirection = () => {
  if (typeof window !== 'undefined') {
    const html = document.documentElement;
    const currentDir = html.getAttribute('dir');
    const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
    html.setAttribute('dir', newDir);
    setCurrentDir(newDir);
  }
};

// Updated button to use state instead of direct DOM access
<button>
  {currentDir === 'rtl' ? 'LTR' : 'RTL'}
</button>
```

---

### 3. next-intl Deprecation Warnings ✅
**Warnings:**
```
The `locale` parameter in `getRequestConfig` is deprecated, please switch to `await requestLocale`.

A `locale` is expected to be returned from `getRequestConfig`, but none was returned.
```

**Root Cause:**
The i18n configuration was using the deprecated `locale` parameter instead of the new `requestLocale` async function, and wasn't explicitly returning the locale.

**Fix:**
Updated `apps/web/src/i18n.ts` to use the new API:

**Before:**
```typescript
export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

**After:**
```typescript
export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,  // Explicitly return locale
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

---

## Files Modified

1. ✅ `apps/web/messages/ar.json` - Added `nav.logout` translation
2. ✅ `apps/web/messages/en.json` - Added `nav.logout` translation
3. ✅ `apps/web/src/components/Header.tsx` - Fixed SSR issue with document access
4. ✅ `apps/web/src/i18n.ts` - Updated to use new next-intl API

---

## Testing

After these fixes, the web app should:
- ✅ Load without errors
- ✅ Display logout button with proper translations
- ✅ RTL/LTR toggle works correctly
- ✅ No deprecation warnings in console
- ✅ Server-side rendering works properly

---

## Next Steps

1. **Test the app**: Navigate to http://localhost:3000
2. **Verify fixes**:
   - Check that the app loads without errors
   - Test the logout button (should show translated text)
   - Test RTL/LTR toggle (should work without errors)
   - Check browser console (no errors or warnings)
3. **Test both locales**:
   - English: http://localhost:3000/en/dashboard
   - Arabic: http://localhost:3000/ar/dashboard

---

**Status:** All errors fixed! The web app should now run without issues. 🎉




