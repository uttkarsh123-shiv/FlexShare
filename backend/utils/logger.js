// Simple logger that only logs in development mode
// Errors are always logged (even in production) for debugging
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  log: (...args) => {
  if (isDevelopment) {
    console.log(...args.map(a =>
      typeof a === 'object' ? '[object]' : a
    ));
  }
}
,
  
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

module.exports = logger;
