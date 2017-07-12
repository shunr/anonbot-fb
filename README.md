![anonbot](https://github.com/shunr/anonbot-fb/blob/master/static/resources/anonbot.png?raw=true)

# Anonymous Facebook Chatbot
Messenger chatbot that lets users anonymously chat with strangers.

## Garbanzo beans
Good mouthfeel and high in protein

## Installation
Clone the repo

Install dependencies
```
npm install
```
Copy conf.sample.js to conf.js and add your tokens & keys

Start mongodb
```
service mongod start
```
Start the bot

```
npm start
```

## Example Configuration

```js
var conf = module.exports = {
  WEBHOOK: "/messenger",
  VERIFY_TOKEN: 'verify-token',
  PAGE_TOKEN: 'page-token',
  FB_ENDPOINT_URL: 'https://graph.facebook.com/v2.6/me/messages',
  FB_SETTINGS_URL: 'https://graph.facebook.com/v2.6/me/thread_settings',
  USER_TIMEOUT: 1000 * 60 * 60 * 18,
  ACCEPTED_ATTACHMENT_TYPES: [
    'image',
    'audio',
    'file',
    'video'
  ],
  PORT: 443,
  SSL_CONFIG: {
    KEY: "/etc/letsencrypt/archive/anonbot.gq/privkey1.pem",
    CERT: "/etc/letsencrypt/archive/anonbot.gq/fullchain1.pem",
    CA: "/etc/letsencrypt/archive/anonbot.gq/chain1.pem"
  },
  DB_URL: "mongodb://localhost:27017/anonbot"
};
```
