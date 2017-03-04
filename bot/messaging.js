'use strict'
const request = require('request');
const conf = require('../conf');

let mod = module.exports = {};

mod.sendText = function(recipient, text) {
  mod.sendMessage({
    recipient: {
      id: recipient
    },
    message: {
      text: text
    }
  });
}

mod.sendButtons = function(recipient, text, buttons) {
  mod.sendMessage({
    recipient: {
      id: recipient
    },
    message: {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": text,
          "buttons": buttons
        }
      }
    }
  });
}

mod.sendQuickReply = function(recipient, text, replies) {
  mod.sendMessage({
    recipient: {
      id: recipient
    },
    message: {
      text: text,
      buttons: replies
    }
  });
}

mod.typingOn = function(recipient) {
  mod.sendMessage({
    recipient: {
      id: recipient
    },
    sender_action: "typing_on"
  });
}

mod.typingOff = function(recipient) {
  mod.sendMessage({
    recipient: {
      id: recipient
    },
    sender_action: "typing_off"
  });
}

mod.sendMessage = function(json) {
  request({
    url: conf.FB_ENDPOINT_URL,
    qs: {
      access_token: conf.PAGE_TOKEN
    },
    method: 'POST',
    json: json
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  });
};