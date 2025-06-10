const auth = require('basic-auth');
const colors = require('colors/safe');

class AuthMiddleware {
  constructor(logger, config) {
    this.logger = logger;
    this.config = config;
  }

  authenticate(req, res, next) {
    // Skip authentication if no credentials are configured
    if (!this.config.hasAuthCredentials()) {
      return next();
    }

    const credentials = auth(req);
    const authConfig = this.config.getAuth();

    if (!credentials || 
        credentials.name !== authConfig.user || 
        credentials.pass !== authConfig.password) {
      this.logger.info(colors.yellow('Authentication failed - Access denied'));
      res.status(401)
         .set('WWW-Authenticate', 'Basic realm="Authentication Required"')
         .json({ error: 'Authentication required' });
      return;
    }

    this.logger.info(colors.green('Authentication successful'));
    next();
  }
}

module.exports = AuthMiddleware; 