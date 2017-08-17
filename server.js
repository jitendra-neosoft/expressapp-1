'use strict';

var express = require('express'),
  app = express(),
  mongoose = require('mongoose'),
  config = require('./config/config'),
  bodyParser = require('body-parser'),
  compression = require('compression'),
  helmet = require('helmet'),
  fs = require('fs'),
  path = require('path'),
  morgan = require('morgan'),
  mail = require('./utils/mail');

mongoose.Promise = global.Promise;
mongoose.connect(config.MONGO_URI);

app.set('env', config.NODE_ENV);
app.set('port', config.PORT);

app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// importing all modules
app.use(require('./modules/auth/authcontroller'));
app.use(require('./modules/user/usercontroller'));
app.use(require('./modules/fileupload/fileuploadcontroller'));

// this route is only for upload file testing using html code use uploadImage api to upload file
app.get('/upload', function (req, res) {
  res.sendFile(__dirname + '/partials/index.html');
});

var sendEmail = function (counter) {

  let mailOptions = {
    from: `Node API 😡<contactjittu@gmail.com>`,
    to: `contactjittu@gmail.com`,
    subject: `API Crashed ✖`,
    html: `<pre><b>Hello Jitendra,
      API is crashing ${counter} times?</b></pre>`
  };
  mail.sendEmail(mailOptions);
}

if (config.CLUSTERING) {

  const cluster = require('cluster');
  const os = require('os');

  if (cluster.isMaster) {
    let crashCount = 0;
    const cpus = os.cpus().length;
    console.log(`Forking for ${cpus} CPUs`);
    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
      if (code !== 0 && !worker.exitedAfterDisconnect) {
        console.log(`Worker ${worker.id} crashed. ` + 'Starting a new worker...');
        crashCount++;
        cluster.fork();

        if (crashCount === 5) {
          console.log('Crashed 5 times, I am sending an email');
          sendEmail(crashCount);
        }
      }
    });

  } else {
    startServer();
  }

} else {
  startServer();
}

function startServer() {
  app.listen(app.get('port'), function () {
    console.log(`Server is listening on http://localhost:`+ app.get('port'));
  });
}

module.exports = app;