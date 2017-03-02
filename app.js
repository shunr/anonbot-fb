'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const conf = require('./conf');

app.set('port', (process.env.PORT || conf.PORT));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('w e w l a d');
})

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === conf.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Invalid token');
  }
});

app.post('/webhook', function (req, res) {
    let events = req.body.entry[0].messaging;
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let sender = event.sender.id;
        if (event.message && event.message.text) {
            let text = event.message.text;
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
        }
    }
    console.log(events);
    res.sendStatus(200);
});

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: conf.FB_ENDPOINT_URL,
        qs: {access_token:conf.PAGE_TOKEN},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

app.listen(app.get('port'), function() {
  console.log('running on port', app.get('port'));
});