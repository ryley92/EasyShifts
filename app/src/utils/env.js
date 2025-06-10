/**
 * Environment configuration utility
 * Supports both build-time and runtime environment variables
 */

// Get environment variable with fallback to runtime config
const getEnvVar = (key, defaultValue = '') => {
  // First try build-time environment variables
  const buildTimeValue = process.env[key];
  if (buildTimeValue) {
    console.log(`ENV: Using build-time value for ${key}:`, buildTimeValue);
    return buildTimeValue;
  }

  // Then try runtime environment variables (from env-config.js)
  if (window._env_ && window._env_[key]) {
    console.log(`ENV: Using runtime value for ${key}:`, window._env_[key]);
    return window._env_[key];
  }

  console.log(`ENV: Using default value for ${key}:`, defaultValue);
  console.log('ENV: Available runtime config:', window._env_);
  return defaultValue;
};

// Environment configuration
export const ENV = {
  // Google OAuth
  GOOGLE_CLIENT_ID: getEnvVar('REACT_APP_GOOGLE_CLIENT_ID'),
  
  // API Configuration
  API_URL: getEnvVar('REACT_APP_API_URL', 'ws://localhost:8080').replace(/\/$/, '') + '/ws',
  
  // Environment
  ENVIRONMENT: getEnvVar('REACT_APP_ENV', 'development'),
  
  // Derived values
  get IS_PRODUCTION() {
    return this.ENVIRONMENT === 'production';
  },
  
  get IS_DEVELOPMENT() {
    return this.ENVIRONMENT === 'development';
  }
};

// Validation
export const validateEnvironment = () => {
  const errors = [];
  
  if (!ENV.GOOGLE_CLIENT_ID) {
    errors.push('REACT_APP_GOOGLE_CLIENT_ID is required');
  }
  
  if (!ENV.API_URL) {
    errors.push('REACT_APP_API_URL is required');
  }
  
  if (errors.length > 0) {
    console.error('Environment validation failed:', errors);
    return false;
  }
  
  console.log('Environment configuration:', {
    GOOGLE_CLIENT_ID: ENV.GOOGLE_CLIENT_ID ? '***configured***' : 'missing',
    API_URL: ENV.API_URL,
    ENVIRONMENT: ENV.ENVIRONMENT
  });
  
  return true;
};

export default ENV;
