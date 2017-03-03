var conf = module.exports = {
  VERIFY_TOKEN: 'verify-token',
  PAGE_TOKEN: 'page-token',
  FB_ENDPOINT_URL: 'https://graph.facebook.com/v2.6/me/messages',
  FB_SETTINGS_URL: 'https://graph.facebook.com/v2.6/me/thread_settings',
  PORT: 443,
  SSL_CONFIG: {
    KEY: "/path/to/privkey1.pem",
    CERT: "/path/to/fullchain1.pem",
    CA: "/path/to/chain1.pem"
  },
  PERSISTENT_MENU: {
    "setting_type": "call_to_actions",
    "thread_state": "existing_thread",
    "call_to_actions": [{
      "type": "postback",
      "title": "Chat with another user",
      "payload": "AB_REROLL_CHAT_PARTNER"
    }, {
      "type": "postback",
      "title": "Stop chatting",
      "payload": "AB_STOP_CHAT"
    }]
  }
};