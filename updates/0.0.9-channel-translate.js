var config = require('../config.json');
var logger = require('log4js').getLogger('updates/channel-translate.js');
var _ = require('lodash');
var fs = require('fs');

var keystone = require('keystone');
async = require('async'), ChannelTranslate = keystone.list('ChannelTranslate'),
Channel = keystone.list('Channel');

var mysql = require('mysql'), mainPool = mysql.createPool(config.mysql.ttt);

var counter = 0;
function importChannelTranslateRow(channelTranslate, next) {
  Channel.model.findOne({
    $query : {'mysql_id' : channelTranslate.channel_id},
    $orderby : {}
  }).exec(function(err, channel) {
    if(channel){
      var newChannelTranslate = {
          mysql_id : channelTranslate.id,
          title : channelTranslate.title,
          lang : channelTranslate.lang,
          channel : channel.id,
          create_date : channelTranslate.create_date
        };
  
        new ChannelTranslate.model(newChannelTranslate).save(function(err) {
          if (err) {
            console.error(channelTranslate);
            console.error(err);
          } else {
            logger.info(++counter);
            logger.info("Added ChannelTranslate " + channelTranslate.id
                + " to the database.");
          }
          next();
      });
     }else{
       next();
     }
  });
}

exports = module.exports = function(next) {
  ChannelTranslate.model
      .findOne({
        $query : {},
        $orderby : {
          _id : -1
        }
      })
      .exec(
          function(err, ChannelTranslate) {
            var sql = 'select * from tbl_channel_title_translate where id > ? order by id asc limit 10000';
            var mysql_id = 0;
            if (ChannelTranslate)
              mysql_id = ChannelTranslate.mysql_id;
            var args = [ mysql_id ];

            mainPool.query(sql, args, function(err, data) {
              if (err) {
                console.dir(err);
              } else {
                async.forEach(data, importChannelTranslateRow, next);
              }
            });

          });
};
