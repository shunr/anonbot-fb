'use strict'
const conf = require('../conf');
var MongoClient = require('mongodb').MongoClient;

let db;
let mod = module.exports = {};

mod.getRooms = function () {
  return db.collection('rooms');
}

mod.getRoomWithUser = function(id, callback) {
  mod.getRooms().findOne({
    users: id
  }, callback);
};

mod.addRoomWithUser = function(id, callback) {
  var room = {
    users: [id],
    full: false
  };
  mod.getRooms().insert(room, {
    w: 1
  }, callback);
};

mod.pairUser = function(id, callback) {
  mod.getRooms().aggregate(
    [{
      $sample: {
        size: 1
      }
    }, {
      $match: {
        full: false
      }
    }],
    function(err, room) {
      if (err || room.length === 0) {
        return callback(true, null);
      } else {
        mod.getRooms().update({
          _id: room[0]._id
        }, {
          $push: {
            users: id
          },
          $set: {
            full: true
          }
        }, function(err, result) {
          callback(err, room[0]);    
        });
      }
    })
};

mod.removeRoomWithUser = function(id, callback) {
  mod.getRooms().remove({
    users: id
  }, callback);
};

mod.removeRoom = function(id, callback) {
  mod.getRooms().remove({
    _id: id
  }, callback);
};

mod.initialize = function(callback) {
  MongoClient.connect(conf.DB_URL, function(err, mong) {
    if (err) {
      return console.log(err);
    }
    db = mong;
    db.collection('rooms').remove({}, function() {
      db.createCollection('rooms', callback);
    });
  });
};