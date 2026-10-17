import jwt from 'jsonwebtoken';

// ─── DEV MODE BYPASS ──────────────────────────────────────────────────────────
// When NODE_ENV=development, protect() and authorizeRoles() are no-ops.
// A safe fallback req.user is injected so route handlers that read
// req.user.id / req.user.name / req.user.role do not crash.
//
// TO RE-ENABLE AUTH: set NODE_ENV=production in backend/.env and restart.
// The entire JWT/auth implementation below is untouched and ready to use.
// ─────────────────────────────────────────────────────────────────────────────
const DEV_MODE = process.env.NODE_ENV !== 'production';

const DEV_USER = {
  id:    '507f1f77bcf86cd799439011',  // valid ObjectId — prevents CastError on farmerId
  name:  'Dev User (No Auth)',
  email: 'dev@agriflow.local',
  role:  'admin',          // admin gives broadest access for development
};

export const protect = async (req, res, next) => {
  // ── Development bypass ───────────────────────────────────────────────────
  if (DEV_MODE) {
    // If a real token was provided, still decode it so the real user identity
    // is used (e.g. quick-login). Fall back to DEV_USER if none is present.
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const rawToken = req.headers.authorization.split(' ')[1];
      if (rawToken && rawToken !== 'null' && rawToken !== 'undefined') {
        try {
          req.user = jwt.verify(
            rawToken,
            process.env.JWT_SECRET || 'agriflow_ai_super_secret_jwt_key_2026_dypcet'
          );
          return next();
        } catch {
          // Invalid token in dev — fall through to DEV_USER instead of rejecting
        }
      }
    }
    req.user = DEV_USER;
    return next();
  }

  // ── Production: full JWT enforcement ────────────────────────────────────
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agriflow_ai_super_secret_jwt_key_2026_dypcet');
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // ── Development bypass ─────────────────────────────────────────────────
    if (DEV_MODE) return next();

    // ── Production: role enforcement ───────────────────────────────────────
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role [${req.user?.role}] is not authorized to access this resource`
      });
    }
    next();
  };
};
