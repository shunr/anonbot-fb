'use strict'
const request = require('request');
const conf = require('../conf');

let mod = module.exports = {};

mod.sendTextMessage = function (sender, text) {
  let messageData = {
    text: text
  }
  request({
    url: conf.FB_ENDPOINT_URL,
    qs: {
      access_token: conf.PAGE_TOKEN
    },
    method: 'POST',
    json: {
      recipient: {
        id: sender
      },
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
};