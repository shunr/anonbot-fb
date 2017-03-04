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
      let text = event.message.text;
      dataservice.getUser(sender, function(err, user) {
        if (err || user == null) {
          messaging.sendText(sender, "⌛ You're not subscribed");
        } else if (user.partner != null) {
          messaging.sendText(user.partner, text);
        } else {
          messaging.sendText(sender, "You're not paired");
        }
      });
    } else if (event.postback && event.postback.payload) {
      let payload = event.postback.payload;
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
      messaging.sendText(id, "❗ Could not start a conversation. Please try again later.");
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
      messaging.sendButtons(id, "Conversation ended. Do you want to start another one?", static_content.BUTTONS.USER_ENDED_PROMPT);
    }
  });
}

function removePartner(id) {
  dataservice.unpairUser(id, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      messaging.sendButtons(id, "The other person left the chat. You're being automatically matched with someone else!", static_content.BUTTONS.PARTNER_ENDED_PROMPT);
    }
  });
}

function pairUser(id) {
  messaging.typingOn(id);
  dataservice.pairUser(id, function(err, result) {
    if (err) {
      messaging.sendText(id, "❗ Nobody is available to chat right now. Dont worry, you will be paired with someone automatically.");
    } else {
      messaging.sendText(id, "✔️ You're now paired with someone else. Say hi!");
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