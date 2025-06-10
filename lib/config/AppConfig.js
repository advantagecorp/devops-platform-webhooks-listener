require('dotenv').config();

/**
 * Configuration management for the application
 */
class AppConfig {
  constructor(options = {}) {
    this.port = options.port || parseInt(process.env.PORT, 10) || 8080;
    this.statusCode = options.statusCode || parseInt(process.env.RESPONSE_CODE, 10) || 200;
    this.auth = {
      user: options.user || process.env.AUTH_USER || null,
      password: options.pass || process.env.AUTH_PASSWORD || null
    };
    this.verbose = options.verbose || process.env.VERBOSE === 'true';
    this.octane = {
      user: process.env.OCTANE_USER,
      password: process.env.OCTANE_PASSWORD
    };

    this.validateConfig();
  }

  validateConfig() {
    // Only validate Octane credentials as they are required
    if (!this.octane.user || !this.octane.password) {
      console.warn('\x1b[33m%s\x1b[0m', 'Warning: Octane credentials not set in environment variables');
    }
  }

  getPort() {
    return this.port;
  }

  getStatusCode() {
    return this.statusCode;
  }

  getAuth() {
    return this.auth;
  }

  isVerbose() {
    return this.verbose;
  }

  getOctaneCredentials() {
    return this.octane;
  }

  hasAuthCredentials() {
    return !!(this.auth.user && this.auth.password);
  }
}

module.exports = AppConfig; 