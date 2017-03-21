'use strict'
const conf = require('../conf');

let mod = module.exports = {};
let timeouts = {};

mod.setTimeout = function (user, callback, delay) {
  if (timeouts[user] != null) {
    clearTimeout(timeouts[user]);
  }
  timeouts[user] = setTimeout(callback, delay);
}

mod.clearTimeout = function (user) {
  if (timeouts[user] != null) {
    clearTimeout(timeouts[user]);
  }
}