'use strict'
var Engine = require('tingodb')();
const conf = require('../conf');
var db = new Engine.Db(conf.DB_PATH, {});

let mod = module.exports = {};

mod.getUsers = function() {
  return db.collection('users');
};

mod.getUser = function(id, callback) {
  mod.getUsers().findOne({
    id: id
  }, callback);
};

mod.isUserSubscribed = function(id, callback) {
  return true;
};

mod.addUser = function(id, callback) {
  var user = {
    id: id,
    partner: id
  };
  mod.getUsers().insert(user, {
    w: 1
  }, callback);
};

mod.removeUser = function(id, callback) {
  mod.getUser(id, function(err, item) {
    if (!err && item.partner != null) {
      mod.unpairUsers(id, item.partner);
    }
  });
  mod.getUsers().remove({
    id: id
  }, callback);
};

mod.unpairUsers = function(id1, id2) {
  mod.getUsers().update({
    id: id1
  }, {
    $set: {
      partner: null
    }
  });
  mod.getUsers().update({
    id: id2
  }, {
    $set: {
      partner: null
    }
  });
};

mod.initialize = function(callback) {
  db.createCollection('users', callback);
};