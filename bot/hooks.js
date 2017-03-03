'use strict'
const fs = require('fs');
const request = require('request');

const conf = require('../conf');
const static_content = require('../static/static_content');

const messaging = require('./messaging');
const dataservice = require('./dataservice');
const pairing = require('./pairing');

let mod = module.exports = {};

const user_options = {
  ROLL: "AB_REROLL_CHAT_PARTNER",
  STOP: "AB_STOP_CHAT"
};

mod.index = function(req, res) {
  res.send(static_content.FLAVOR_TEXT);
};

mod.handleMessage = function(req, res) {
  let events = req.body.entry[0].messaging;
  for (let i = 0; i < events.length; i++) {
    let event = events[i];
    let sender = event.sender.id;
    if (event.message && event.message.text) {
      if (event.message.is_echo) {
        continue;
      }
      console.log(sender);
      let text = event.message.text;

      dataservice.getUser(sender, function(err, item) {
        if (err) {
          messaging.sendTextMessage(sender, "You're not subscribed");
        } else if (item.partner != null) {
          messaging.sendTextMessage(item.partner, text);
        } else {
          messaging.sendTextMessage(sender, "You're not paired");
        }
      });

    } else if (event.postback && event.postback.payload) {
      let payload = event.postback.payload;
      console.log(payload);
      if (payload == user_options.ROLL) {
        dataservice.getUser(sender, function(err, item) {
          if (err) {
            addUser(sender);
          } else {
            pairUser(sender);
          }
        });
      } else if (payload == user_options.STOP) {
        removeUser(sender);
      }
    }
  }
  res.sendStatus(200);
};

function addUser(id) {
  dataservice.addUser(id, function(err, result) {
    if (err) {
      messaging.sendTextMessage(id, "Could not register");
    } else {
      messaging.sendTextMessage(id, "You're registered");
    }
  });
}

function removeUser(id) {
  dataservice.removeUser(id, function(err, result) {
    if (err) {
      messaging.sendTextMessage(id, "Try again");
    } else {
      messaging.sendTextMessage(id, "BYE");
    }
  });
}

function pairUser(id) {
  dataservice.addUser(id, function(err, result) {
    if (err) {
      messaging.sendTextMessage(id, "Could not register");
    } else {
      messaging.sendTextMessage(id, "You're paired");
    }
  });
}

mod.initialize = function(req, res) {
  if (req.query['hub.verify_token'] === conf.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
    request({
      url: conf.FB_SETTINGS_URL,
      method: "POST",
      form: {
        access_token: conf.PAGE_TOKEN
      },
      json: static_content.PERSISTENT_MENU
    });
  } else {
    res.send('Invalid token');
  }
};