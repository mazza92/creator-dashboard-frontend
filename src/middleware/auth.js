import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient';

// Rate limiting configuration
const rateLimit = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Maximum requests per window

export const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Clean up old entries
  for (const [key, value] of rateLimit.entries()) {
    if (value.timestamp < windowStart) {
      rateLimit.delete(key);
    }
  }

  // Check rate limit
  const userRequests = rateLimit.get(ip) || { count: 0, timestamp: now };
  if (userRequests.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }

  // Update rate limit
  rateLimit.set(ip, {
    count: userRequests.count + 1,
    timestamp: now
  });

  next();
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateFileUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'Invalid file type' };
  }

  if (file.size > maxSize) {
    return { valid: false, message: 'File size too large' };
  }

  return { valid: true };
}; 