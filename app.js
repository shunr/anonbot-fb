'use strict'
const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const conf = require('./conf');
const hooks = require('./bot/hooks');
const dataservice = require('./bot/dataservice');

app.set('port', (process.env.PORT || conf.PORT));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

let ssl_settings = {
  key: fs.readFileSync(conf.SSL_CONFIG.KEY),
  cert: fs.readFileSync(conf.SSL_CONFIG.CERT),
  ca: fs.readFileSync(conf.SSL_CONFIG.CA)
};

function startServer() {
  https.createServer(ssl_settings, app).listen(app.get('port'), function() {
    console.log('Running on port', app.get('port'));
  });
  app.get('/', hooks.index)
  app.get('/webhook', hooks.initialize);
  app.post('/webhook', hooks.handleMessage);
}

dataservice.initialize(function(err, collection) {
  if (err) {
    throw err;
  } else {
    startServer();
  }
});