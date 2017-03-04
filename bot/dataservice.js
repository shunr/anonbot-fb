'use strict'
const conf = require('../conf');
var MongoClient = require('mongodb').MongoClient;

let db;
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
    partner: null
  };
  mod.getUsers().insert(user, {
    w: 1
  }, callback);
};

mod.pairUser = function(id, callback) {
  mod.getUsers().aggregate(
    [{
      $sample: {
        size: 1
      }
    }, {
      $match: {
        id: {
          $ne: id
        },
        partner: null
      }
    }],
    function(err, item) {
      if (err || item.length === 0) {
        return callback(true, null);
      } else {
        mod.getUsers().update({
          id: id
        }, {
          $set: {
            partner: item[0].id
          }
        }, function(err, result) {
          
          mod.getUsers().update({
            id: item[0].id
          }, {
            $set: {
              partner: id
            }
          }, callback)
        });

      }
    })
};

mod.removeUser = function(id, callback) {
  mod.getUser(id, function(err, item) {
    mod.getUsers().remove({
      id: id
    }, callback);
  });
};

mod.unpairUser = function(id, callback) {
  mod.getUsers().update({
    id: id
  }, {
    $set: {
      partner: null
    }
  }, callback);
};

mod.initialize = function(callback) {
  MongoClient.connect(conf.DB_URL, function(err, mong) {
    if (err) {
      return console.log(err);
    }
    db = mong;
    db.collection('users').remove({}, function() {
      db.createCollection('users', callback);
    });
  });
};