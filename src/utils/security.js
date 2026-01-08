import { securityConfig } from '../config/security';

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove on* attributes
    .trim();
};

// Password validation
export const validatePassword = (password) => {
  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = securityConfig.passwordPolicy;
  
  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters long` };
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true };
};

// File validation
export const validateFile = (file) => {
  const { maxSize, allowedTypes } = securityConfig.fileUpload;
  
  if (file.size > maxSize) {
    return { valid: false, message: `File size must be less than ${maxSize / (1024 * 1024)}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'File type not allowed' };
  }
  
  return { valid: true };
};

// XSS prevention
export const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// CSRF token generation
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Secure cookie options
export const getSecureCookieOptions = () => {
  return {
    ...securityConfig.session.cookie,
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined
  };
};

// Rate limiting check
export const checkRateLimit = (ip, requests) => {
  const { windowMs, max } = securityConfig.rateLimit;
  const now = Date.now();
  
  // Clean old requests
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= max) {
    return { allowed: false, retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000) };
  }
  
  return { allowed: true };
};

// JWT token validation
export const validateToken = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    if (decoded.exp < now) {
      return { valid: false, message: 'Token has expired' };
    }
    
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, message: 'Invalid token' };
  }
}; 