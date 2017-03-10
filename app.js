'use strict'
const fs = require('fs');
const request = require('request');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const conf = require('./conf');
const static_content = require('./static/static_content');
const hooks = require('./bot/hooks');
const dbservice = require('./bot/dbservice');

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
  app.get(conf.WEBHOOK, hooks.initialize);
  app.post(conf.WEBHOOK, hooks.handleMessage);
  request({
    url: conf.FB_SETTINGS_URL,
    method: "POST",
    headers: {"Content-Type": "application/json"},
    qs: {
      access_token: conf.PAGE_TOKEN
    },
    json: static_content.PERSISTENT_MENU
  });
}

dbservice.initialize(function(err, collection) {
  if (err) {
    throw err;
  } else {
    startServer();
  }
});