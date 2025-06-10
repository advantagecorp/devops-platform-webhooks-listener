const colors = require('colors/safe');
const moment = require('moment');
const cliui = require('cliui');

class LoggerService {
  constructor(config) {
    this.config = config;
  }

  info(message, ...args) {
    console.log(message, ...args);
  }

  error(message, ...args) {
    console.error(message, ...args);
  }

  logRequest(req) {
    const time = moment().format('DD-MMM-YYYY HH:mm:ss.SSS');
    this.info(
      '[%s] %s %s "%s"',
      time,
      colors.cyan(req.method),
      colors.cyan(req.url),
      req.headers['user-agent']
    );

    if (this.config.isVerbose()) {
      this.logHeaders(req);
    }
  }

  logHeaders(req) {
    let prettyHeaders = JSON.stringify(req.headers, null, 2);
    prettyHeaders = prettyHeaders.replace(/": "/g, '":\t "');
    const ui = cliui();
    ui.div(prettyHeaders);
    this.info(colors.cyan('Received headers:\n'), colors.yellow(ui.toString()));
  }

  logBody(body) {
    if (!this.config.isVerbose()) {
      return;
    }

    let prettyBody;
    const strBody = Buffer.concat(body).toString();

    try {
      prettyBody = JSON.stringify(JSON.parse(strBody), null, 2);
    } catch (e) {
      prettyBody = strBody;
    }

    if (prettyBody) {
      this.info(colors.cyan('Received body:\n'), colors.yellow(prettyBody));
    } else {
      this.info(colors.cyan('Received empty body.'));
    }
  }

  logServerAddresses(port) {
    const ifaces = require('os').networkInterfaces();
    let arrAddresses = [];

    Object.keys(ifaces).forEach(netAdapter => {
      ifaces[netAdapter].forEach(details => {
        if (details.family === 'IPv4' && !details.internal) {
          arrAddresses.push('  http://' + details.address + ':' + colors.green(port) + '\t  (' + netAdapter + ')');
        }
      });
    });

    const ui = cliui();
    ui.div(arrAddresses.join('\n'));
    this.info(colors.yellow('Available on:'));
    this.info(ui.toString());
  }
}

module.exports = LoggerService; 