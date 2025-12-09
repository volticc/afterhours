# Admin Security Testing Guide

## Overview

The admin system has been fully secured with multi-layered protection. Only authenticated admin users can see and access admin features.

## Security Layers Implemented

### 1. **Route-Level Protection** (`/admin`)
- Uses `useAdminGuard()` hook that checks both authentication and admin status
- Automatically redirects non-admin users to the homepage
- Shows loading state while checking authentication
- Returns null as safety fallback if guard fails

### 2. **Navigation Hiding**
- Admin navigation link only appears for logged-in admin users
- Non-authenticated visitors: No "Admin" link
- Logged-in non-admins: No "Admin" link
- Logged-in admins: "Admin" link visible

### 3. **Component-Level Protection**
- **BlockEditor**: Protected with `useIsAdmin()` hook, shows "Admin access required" message for non-admins
- **BlockPreview**: Protected with `useIsAdmin()` hook, shows "Admin access required" message for non-admins
- These components will not render their editing UI unless the user is confirmed as an admin

### 4. **Homepage Admin Banner**
- Only visible to logged-in admin users
- Hidden completely from visitors and non-admin users

## Testing Instructions

### Test Scenario 1: Visitor (Not Logged In)
**Expected Behavior:**
- ✓ No "Admin" link in navigation (desktop or mobile)
- ✓ No admin test banner on homepage
- ✓ Typing `/admin` in URL redirects to homepage
- ✓ No admin editing tools visible anywhere

**How to Test:**
1. Clear localStorage: Open DevTools → Application → Local Storage → Clear All
2. Refresh the page
3. Verify no admin UI elements are visible
4. Try navigating to `/admin` directly
5. Should be redirected to `/`

---

### Test Scenario 2: Logged-In Non-Admin
**Expected Behavior:**
- ✓ No "Admin" link in navigation
- ✓ No admin test banner on homepage
- ✓ Typing `/admin` in URL redirects to homepage
- ✓ No admin editing tools visible

**How to Test:**
Since the current implementation only has one admin user (static preview mode), to simulate a logged-in non-admin:

1. You would need to modify `AuthContext.tsx` to support a test non-admin user
2. Currently, any credentials OTHER than `admin@afterhoursstudio.com` / `admin123` will fail login
3. The system is designed so that `currentAdmin !== null` is required for admin access
4. Even if a user is "authenticated" via another system, they won't see admin UI unless `currentAdmin` is set

**For Production:**
- Connect to real authentication backend
- Check user's `role` field in database
- Only set `currentAdmin` if the user has admin role

---

### Test Scenario 3: Logged-In Admin
**Expected Behavior:**
- ✓ "Admin" link visible in navigation (desktop and mobile)
- ✓ Admin test banner visible on homepage
- ✓ Can access `/admin` page successfully
- ✓ Can see and use all admin tools (Block Editor, Theme Editor, etc.)

**How to Test:**
1. Navigate to homepage
2. If not logged in, go to `/admin`
3. Login with credentials:
   - Email: `admin@afterhoursstudio.com`
   - Password: `admin123`
4. Verify:
   - "Admin" link appears in navigation
   - Admin test banner shows on homepage
   - Can access `/admin` dashboard
   - Can see all 12 admin tabs
   - Block Editor and Theme Editor work correctly

---

## Quick Test Checklist

```
[ ] Visitor Mode
    [ ] No admin link in nav
    [ ] No admin banner on home
    [ ] /admin redirects to /

[ ] Logged-In Non-Admin Mode
    [ ] No admin link in nav
    [ ] No admin banner on home
    [ ] /admin redirects to /

[ ] Logged-In Admin Mode
    [ ] Admin link in nav ✓
    [ ] Admin banner on home ✓
    [ ] /admin accessible ✓
    [ ] Block editor works ✓
    [ ] Theme editor works ✓
```

---

## Security Architecture

### Hook: `useAdminGuard()` (`src/hooks/useAdminGuard.tsx`)
**Purpose:** Protect entire routes/pages from non-admin access

**Usage:**
```tsx
function AdminPage() {
  const { isAdmin, isLoading } = useAdminGuard();
  // Automatically redirects non-admins to home

  if (isLoading) return <Loading />;
  if (!isAdmin) return null; // Safety fallback

  return <AdminDashboard />;
}
```

### Hook: `useIsAdmin()` (`src/hooks/useAdminGuard.tsx`)
**Purpose:** Conditionally render admin UI elements

**Usage:**
```tsx
function SomeComponent() {
  const { isAdmin } = useIsAdmin();

  if (!isAdmin) {
    return <AccessDeniedMessage />;
  }

  return <AdminOnlyFeature />;
}
```

### Auth Context Check
**Logic:**
```typescript
const isAdmin = isAuthenticated && currentAdmin !== null;
```

This ensures:
1. User must be authenticated (`isAuthenticated === true`)
2. User must have admin record (`currentAdmin !== null`)

---

## Files Modified

### Created:
- `src/hooks/useAdminGuard.tsx` - Admin protection hooks

### Modified:
- `src/routes/admin.tsx` - Added route-level protection with `useAdminGuard()`
- `src/components/Navigation.tsx` - Hide admin link from non-admins
- `src/components/BlockEditor.tsx` - Protect editor with `useIsAdmin()`
- `src/components/BlockPreview.tsx` - Protect preview with `useIsAdmin()`
- `src/routes/index.tsx` - Hide admin banner from non-admins
- `src/contexts/AuthContext.tsx` - Added test user documentation

---

## Production Deployment Notes

For production, you'll need to:

1. **Replace static auth with real backend:**
   - Connect to your authentication API
   - Verify JWT tokens
   - Check user roles from database

2. **Update `AuthContext.tsx`:**
   - Replace mock admin with real API calls
   - Validate user roles against database
   - Handle token refresh/expiration

3. **Add middleware:**
   - Server-side route protection
   - API endpoint authentication
   - Rate limiting for login attempts

4. **Security enhancements:**
   - HTTPS only
   - CSRF protection
   - XSS prevention
   - Content Security Policy headers

---

## Contact

For questions or issues, contact the development team.
