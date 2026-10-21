import { Request, Response, NextFunction } from 'express';

/**
 * Parses and normalizes the ADMIN_EMAILS environment variable.
 * Exact matching only — NO wildcard matching, NO domain-level checks like includes('@vixora...').
 */
export function getAuthorizedAdminEmails(): Set<string> {
  const rawAdminEmails = process.env.ADMIN_EMAILS || '';
  const emailList = rawAdminEmails
    .replace(/^["\']|["\']$/g, '')
    .split(',')
    .map((e) => e.trim().replace(/^["\']|["\']$/g, '').toLowerCase())
    .filter((e) => e.length > 0 && e.includes('@'));

  return new Set(emailList);
}

/**
 * requireAdmin Middleware
 * Relies on requireAuthentication having already run and populated req.user from Supabase Auth.
 * Authorizes the user by comparing their verified email against the exact ADMIN_EMAILS allowlist.
 * Never trusts any browser-supplied role, permissions, or headers.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || !req.user.email) {
    return res.status(401).json({
      error: 'Authentication required prior to admin authorization check.',
      code: 'UNAUTHENTICATED'
    });
  }

  const verifiedEmail = req.user.email.toLowerCase().trim();
  const allowedAdmins = getAuthorizedAdminEmails();

  if (!allowedAdmins.has(verifiedEmail)) {
    return res.status(403).json({
      error: 'Access denied: verified account is not an authorized administrator.',
      code: 'FORBIDDEN_NOT_ADMIN'
    });
  }

  next();
}
