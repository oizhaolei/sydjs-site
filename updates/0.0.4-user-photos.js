"use strict";
var config = require('../config.json');
var logger = require('log4js').getLogger('updates/user-photos.js');
var _ = require('lodash');
var fs = require('fs');

var keystone = require('keystone'), async = require('async'), UserPhoto = keystone
    .list('UserPhoto'), Channel = keystone.list('Channel'), TttUser = keystone
    .list('TttUser');

var mysql = require('mysql'), mainPool = mysql.createPool(config.mysql.ttt);

var counter = 0;
function importUserPhotoRow(user_photo, next) {
  TttUser.model.findOne({
    $query : {
      'mysql_id' : user_photo.userid
    },
    $orderby : {}
  }).exec(
      function(err, tttUser) {
        if (tttUser) {
          Channel.model.findOne({
            $query : {
              'mysql_id' : user_photo.channel_id
            },
            $orderby : {}
          }).exec(
              function(err, channel) {
                var channel_id;
                if (channel) {
                  channel_id = channel.id;
                }
                var newUserPhoto = {
                  mysql_id : user_photo.id,
                  user_id : user_photo.userid,
                  pic_url : user_photo.pic_url,
                  content : user_photo.content,
                  lang : user_photo.lang,
                  address : user_photo.address,
                  late6 : user_photo.late6,
                  lnge6 : user_photo.lnge6,
                  width : user_photo.width,
                  height : user_photo.height,
                  author : tttUser.id,
                  channel : channel_id,
                  create_date : user_photo.create_date
                };
                new UserPhoto.model(newUserPhoto).save(function(err) {
                  if (err) {
                    console.error(user_photo);
                    console.error(err);
                  } else {
                    logger.info(++counter);
                    logger.info("Added user_photo " + user_photo.id
                        + " to the database.");
                  }
                  next();
                });
              });
        } else {
          next();
        }
      });
}

exports = module.exports = function(next) {
  UserPhoto.model
      .findOne({
        $query : {},
        $orderby : {
          _id : -1
        }
      })
      .exec(
          function(err, userPhoto) {
            var sql = 'select up.* from tbl_user_photo up where up.id > ? and up.parent_id = 0 order by up.id asc limit 10000';
            var mysql_id = 0;
            if (userPhoto)
              mysql_id = userPhoto.mysql_id;
            var args = [ mysql_id ];

            mainPool.query(sql, args, function(err, data) {
              if (err) {
                console.dir(err);
              } else {
                async.forEach(data, importUserPhotoRow, next);
              }
            });

          });
};
