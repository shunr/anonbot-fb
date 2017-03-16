'use strict'
const fs = require('fs');
const request = require('request');

const conf = require('../conf');
const bot_alerts = require('../bot/botalerts');

const messaging = require('./messaging');
const dbservice = require('./dbservice');
const pairing = require('./pairing');

let mod = module.exports = {};

const user_options = {
  ROLL: "AB_REROLL_CHAT_PARTNER",
  STOP: "AB_STOP_CHAT",
  START: "AB_START"
};

mod.index = function(req, res) {
  res.send("f l a v o r t e x t");
};

mod.handleMessage = function(req, res) {
  let events = req.body.entry[0].messaging;
  for (let i = 0; i < events.length; i++) {
    let event = events[i];
    let sender = event.sender.id;
    if (event.message && !event.message.quick_reply) {
      if (event.message.is_echo) {
        continue;
      }
      let message = {
        text: event.message.text,
        attachment: (event.message.attachments) ? event.message.attachments[0] : undefined
      };
      if (event.message.attachments && event.message.attachments[0]) {
        let att = event.message.attachments[0];
        if (conf.ACCEPTED_ATTACHMENT_TYPES.includes(att.type)) {
          message.attachment = {
            type: att.type,
            payload: {
              url: att.payload.url
            }
          };
        }
      }
      dbservice.getRoomWithUser(sender, function(err, room) {
        if (err || room == null) {
          bot_alerts.INTRO(sender);
        } else if (room.full === true) {
          for (let i = 0; i < room.users.length; i++) {
            if (room.users[i] != sender) {
              messaging.sendChat(room.users[i], message);
            }
          }
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
          messaging.typingOn(sender);
          dbservice.getRoomWithUser(sender, function(err, room) {
            if (err || room == null) {
              pairUser(sender);
            } else {
              removeRoom(room, sender, pairUser);
            }
          });
          break;
        case user_options.STOP:
          messaging.typingOn(sender);
          dbservice.getRoomWithUser(sender, function(err, room) {
            if (!err && room != null) {
              removeRoom(room, sender);
            } else {
              bot_alerts.NOT_REGISTERED(sender);
            }
          });
          break;
        case user_options.START:
          bot_alerts.INTRO(sender);
          break;
      }
    }
  }
  res.sendStatus(200);
};

function newRoomWithUser(id) {
  dbservice.addRoomWithUser(id, function(err, result) {
    if (err) {
      bot_alerts.REGISTRATION_ERROR(id);
    } else {
      bot_alerts.NO_PARTNERS(id);
    }
  });
}

function removeRoom(room, initiator, callback) {
  dbservice.removeRoom(room._id, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < room.users.length; i++) {
        if (room.users[i] == initiator) {
          if (callback == null) {
            bot_alerts.USER_ENDED(room.users[i]);
          }
        } else {
          bot_alerts.PARTNER_ENDED(room.users[i]);
        }
      }
      if (callback) {
        callback(initiator);
      }
    }
  });
}

function pairUser(id) {
  dbservice.pairUser(id, function(err, room) {
    if (err) {
      newRoomWithUser(id);
    } else if (room) {
      bot_alerts.PARTNER_FOUND(id);
      for (let i = 0; i < room.users.length; i++) {
        if (room.users[i] != id) {
          bot_alerts.PARTNER_FOUND_OTHER(room.users[i]);
        }
      }
    }
  });
}

mod.initialize = function(req, res) {
  if (req.query['hub.verify_token'] === conf.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Invalid token');
  }
};