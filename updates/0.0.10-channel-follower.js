var config = require('../config.json');
var logger = require('log4js').getLogger('updates/channel_follower.js');
var _ = require('lodash');
var fs = require('fs');

var keystone = require('keystone');
async = require('async'), ChannelFollower = keystone.list('ChannelFollower'),
Channel = keystone.list('Channel'),
TttUser = keystone.list('TttUser');

var mysql = require('mysql'), mainPool = mysql.createPool(config.mysql.ttt);

var counter = 0;
function importChannelFollowerRow(channelFollower, next) {
  TttUser.model.findOne({
    $query : {'mysql_id' : channelFollower.user_id},
    $orderby : {}
  }).exec(function(err, tttUser) {
    if(tttUser){
      Channel.model.findOne({
        $query : {'mysql_id' : channelFollower.channel_id},
        $orderby : {}
      }).exec(function(err, channel) {
        if(channel){
          var newChannelFollower = {
              mysql_id : channelFollower.id,
              channel : channel.id,
              author : tttUser.id,
              create_date : channelFollower.create_date
            };
      
            new ChannelFollower.model(newChannelFollower).save(function(err) {
              if (err) {
                console.error(channelFollower);
                console.error(err);
              } else {
                logger.info(++counter);
                logger.info("Added channelFollower " + channelFollower.id
                    + " to the database.");
              }
              next();
          });
         }else{
           next();
         }
      });
    } else {
      next();
    }
  });
}

exports = module.exports = function(next) {
  ChannelFollower.model
      .findOne({
        $query : {},
        $orderby : {
          _id : -1
        }
      })
      .exec(
          function(err, channelFollower) {
            var sql = 'select * from tbl_channel_follower where id > ? order by id asc limit 10000';
            var mysql_id = 0;
            if (channelFollower)
              mysql_id = channelFollower.mysql_id;
            var args = [ mysql_id ];

            mainPool.query(sql, args, function(err, data) {
              if (err) {
                console.dir(err);
              } else {
                async.forEach(data, importChannelFollowerRow, next);
              }
            });

          });
};
