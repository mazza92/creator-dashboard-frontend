// Environment configuration
const env = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // API Configuration
  API_URL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://backend-self-beta-75.vercel.app'),
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret',
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev-session-secret',
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_KEY || 'your-supabase-key',
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'your-bucket-name',
  
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'creator_dashboard',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  
  // API Keys
  STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key',
  
  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://newcollab.co',
    'https://www.newcollab.co'
  ],
  
  // Cookie
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'newcollab.co',
};

// Only validate required environment variables in production
if (env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'SESSION_SECRET',
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'STRIPE_SECRET_KEY'
  ];

  const missingEnvVars = requiredEnvVars.filter(key => !env[key]);

  if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    throw new Error('Missing required environment variables');
  }
}

export default env; 