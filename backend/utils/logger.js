const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  log:   (...args) => { if (isDev) console.log(...args); },
  warn:  (...args) => { if (isDev) console.warn(...args); },
  error: (...args) => console.error(...args), // always log errors
};

module.exports = logger;
