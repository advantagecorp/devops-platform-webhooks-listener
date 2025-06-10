/**
 * Copyright 2018 EntIT Software LLC, a Micro Focus company
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const express = require('express');
const portfinder = require('portfinder');
const colors = require('colors/safe');

const AppConfig = require('./config/AppConfig');
const AuthMiddleware = require('./middleware/AuthMiddleware');
const LoggerService = require('./services/LoggerService');
const OctaneService = require('./services/OctaneService');

class Server {
  constructor(logger, options) {
    this.config = new AppConfig(options);
    this.logger = new LoggerService(this.config);
    this.authMiddleware = new AuthMiddleware(this.logger, this.config);
    this.octaneService = new OctaneService(this.logger, this.config);
  }

  async requestHandler(req, res) {
    const body = [];
    this.logger.logRequest(req);

    res.on('error', err => this.logger.error(colors.red('Error on response'), err));

    req.on('error', err => this.logger.error(colors.red('Error on request'), err))
      .on('data', chunk => body.push(chunk))
      .on('end', async () => {
        try {
          this.logger.logBody(body);
          
          const webhookData = JSON.parse(Buffer.concat(body).toString());
          await this.octaneService.updateEntity(webhookData);
          
          res.status(this.config.getStatusCode()).json({
            status: 'success',
            message: 'Webhook processed successfully'
          });
        } catch (error) {
          this.logger.error('Error processing webhook:', error);
          res.status(500).json({
            status: 'error',
            message: 'Error processing webhook'
          });
        }
      });
  }

  async getPort() {
    if (this.config.getPort()) {
      return this.config.getPort();
    }

    portfinder.basePort = 8080;
    return portfinder.getPortPromise();
  }

  async listen() {
    const port = await this.getPort();
    const app = express();

    // Add middleware
    app.use(this.authMiddleware.authenticate.bind(this.authMiddleware));
    app.all("*", this.requestHandler.bind(this));

    app.listen(port, () => {
      this.logger.info(colors.yellow('Starting up devops-platform-webhooks-listener.'));
      this.logger.logServerAddresses(port);
      this.logger.info('Press CTRL-C to stop the server\n');
    });

    this.setupTerminationHandlers();
  }

  setupTerminationHandlers() {
    if (process.platform === 'win32') {
      require('readline')
        .createInterface({
          input: process.stdin,
          output: process.stdout
        })
        .on('SIGINT', () => process.emit('SIGINT'));
    }

    const terminationHandler = () => {
      this.logger.info(colors.red('devops-platform-webhooks-listener stopped.'));
      process.exit();
    };

    process.on('SIGINT', terminationHandler);
    process.on('SIGTERM', terminationHandler);
  }
}

module.exports = Server;

