"use strict";
var config = require('../config.json');
var logger = require('log4js').getLogger('updates/channel.js');
var _ = require('lodash');
var fs = require('fs');

var keystone = require('keystone'), async = require('async'), Channel = keystone
    .list('Channel'), TttUser = keystone.list('TttUser');

var mysql = require('mysql'), mainPool = mysql.createPool(config.mysql.ttt);

var counter = 0;
function importChannelRow(channel, next) {
  var newChannel = {
    mysql_id : channel.id,
    pic_url : channel.pic_url,
    follower_count : channel.follower_count,
    popular_count : channel.popular_count,
    recommend : channel.recommend,
    create_date : channel.create_date
  };

  new Channel.model(newChannel).save(function(err) {
    if (err) {
      console.error(channel);
      console.error(err);
    } else {
      logger.info(++counter);
      logger.info("Added channel " + channel.id + " to the database.");
    }
    next();
  });
}

exports = module.exports = function(next) {
  Channel.model
      .findOne({
        $query : {},
        $orderby : {
          _id : -1
        }
      })
      .exec(
          function(err, channel) {
            var sql = 'select * from tbl_channel where id > ? order by id asc limit 10000';
            var mysql_id = 0;
            if (channel)
              mysql_id = channel.mysql_id;
            var args = [ mysql_id ];

            mainPool.query(sql, args, function(err, data) {
              if (err) {
                console.dir(err);
              } else {
                async.forEach(data, importChannelRow, next);
              }
            });

          });
};
