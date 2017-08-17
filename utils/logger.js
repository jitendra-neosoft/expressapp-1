'use strict';

const fs = require('fs');
const dir = './log';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const winston = require('winston');
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');


var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.DailyRotateFile)({
      filename: dir + '/app.log', json: true
    })
  ],
  exitOnError: false
});

module.exports = logger;