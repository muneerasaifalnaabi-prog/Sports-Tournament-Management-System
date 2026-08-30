---
name: auth-authorization
description: Auth and RBAC conventions for STMS — use when touching src/lib/auth.ts, proxy.ts, rbac.ts, or any protected route/page.
---

# Auth & Authorization Checklist

- Never store plaintext passwords or the JWT secret in code — `JWT_SECRET` comes from `.env` only; `.env` stays in `.gitignore`.
- Session cookie must be `httpOnly`, `sameSite=lax`, and `secure` in production.
- Always verify JWT signature and expiry on every protected request — never just base64-decode the payload.
- Centralize role-check logic in `src/lib/rbac.ts` — never duplicate role arrays inline across routes.
- Role checks alone are not enough for Team Manager actions — also verify resource ownership (e.g. `isTeamManagerOf(userId, teamId)`) before allowing a mutation.
- `proxy.ts` protects page routes by path matcher; every API route independently re-checks auth + role too (defense in depth — never rely on UI hiding or the proxy alone).
- Return 401 for "not authenticated" and 403 for "authenticated but not allowed" — don't conflate them.
- Login failure returns a generic "invalid credentials" message — never reveal whether the email exists.
- New protected page or route added later? Re-run this checklist against it, don't assume it inherits protection.
