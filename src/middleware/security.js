import { securityConfig } from '../config/security';
import { validateToken } from '../utils/security';

// Security middleware stack
export const securityMiddleware = [
  // Rate limiting
  (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - securityConfig.rateLimit.windowMs;

    // Clean up old entries
    for (const [key, value] of rateLimit.entries()) {
      if (value.timestamp < windowStart) {
        rateLimit.delete(key);
      }
    }

    // Check rate limit
    const userRequests = rateLimit.get(ip) || { count: 0, timestamp: now };
    if (userRequests.count >= securityConfig.rateLimit.max) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    // Update rate limit
    rateLimit.set(ip, {
      count: userRequests.count + 1,
      timestamp: now
    });

    next();
  },

  // Security headers
  (req, res, next) => {
    Object.entries(securityConfig.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    next();
  },

  // CORS
  (req, res, next) => {
    const origin = req.headers.origin;
    if (securityConfig.cors.origin.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', securityConfig.cors.methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', securityConfig.cors.allowedHeaders.join(', '));
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', securityConfig.cors.maxAge);
    }
    next();
  },

  // JWT Authentication
  async (req, res, next) => {
    // Skip authentication for public routes
    if (req.path.startsWith('/public/') || req.path === '/login' || req.path === '/register') {
      return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { valid, message, decoded } = validateToken(token);
    if (!valid) {
      return res.status(401).json({ error: message });
    }

    req.user = decoded;
    next();
  },

  // Request sanitization
  (req, res, next) => {
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeInput(req.body[key]);
        }
      });
    }
    next();
  }
];

// Export individual middleware for specific routes
export const rateLimiter = securityMiddleware[0];
export const securityHeaders = securityMiddleware[1];
export const corsMiddleware = securityMiddleware[2];
export const jwtAuth = securityMiddleware[3];
export const requestSanitizer = securityMiddleware[4]; 