'use strict'
const fs = require('fs');
const request = require('request');

const conf = require('../conf');
const bot_alerts = require('../bot/botalerts');

const messaging = require('./messaging');
const dataservice = require('./dataservice');
const pairing = require('./pairing');

let mod = module.exports = {};

const user_options = {
  ROLL: "AB_REROLL_CHAT_PARTNER",
  STOP: "AB_STOP_CHAT"
};

mod.index = function(req, res) {
  res.send("f l a v o r t e x t");
};

mod.handleMessage = function(req, res) {
  let events = req.body.entry[0].messaging;
  for (let i = 0; i < events.length; i++) {
    let event = events[i];
    let sender = event.sender.id;
    if (event.message && event.message.text && !event.message.quick_reply) {
      if (event.message.is_echo) {
        continue;
      }
      let text = event.message.text;
      dataservice.getUser(sender, function(err, user) {
        if (err || user == null) {
          bot_alerts.INTRO(sender);
        } else if (user.partner != null) {
          messaging.sendText(user.partner, text);
        } else {
          bot_alerts.NOT_PAIRED(sender);
        }
      });
    } else if ((event.postback && event.postback.payload) || (event.message && event.message.quick_reply)) {
      let payload;
      if (event.postback && event.postback.payload) {
        payload = event.postback.payload;
      } else if (event.message.quick_reply) {
        payload = event.message.quick_reply.payload;
      }
      switch (payload) {
        case user_options.ROLL:
          dataservice.getUser(sender, function(err, user) {
            if (err || user == null) {
              addUser(sender);
            } else {
              pairUser(sender);
              if (user.partner != null) {
                removePartner(user.partner);
              }
            }
          });
          break;
        case user_options.STOP:
          dataservice.getUser(sender, function(err, user) {
            if (!err && user != null) {
              removeUser(sender);
              if (user.partner != null) {
                removePartner(user.partner);
              }
            } else {
              bot_alerts.NOT_REGISTERED(sender);
            }
          });
          break;
      }
    }
  }
  res.sendStatus(200);
};

function addUser(id) {
  dataservice.addUser(id, function(err, result) {
    if (err) {
      bot_alerts.REGISTRATION_ERROR(id);
    } else {
      pairUser(id);
    }
  });
}

function removeUser(id) {
  dataservice.removeUser(id, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      bot_alerts.USER_ENDED(id);
    }
  });
}

function removePartner(id) {
  dataservice.unpairUser(id, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      bot_alerts.PARTNER_ENDED(id);
      messaging.typingOn(id);
    }
  });
}

function pairUser(id) {
  messaging.typingOn(id);
  dataservice.pairUser(id, function(err, partner) {
    if (err) {
      bot_alerts.NO_PARTNERS(id);
    } else if (partner) {
      bot_alerts.PARTNER_FOUND(id);
      bot_alerts.PARTNER_FOUND_OTHER(partner);
    }
    messaging.typingOff(id);
  });
}

mod.initialize = function(req, res) {
  if (req.query['hub.verify_token'] === conf.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Invalid token');
  }
};