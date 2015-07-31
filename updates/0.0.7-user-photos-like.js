var config = require('../config.json');
var logger = require('log4js').getLogger('updates/user-photos-comment.js');
var _ = require('lodash');
var fs = require('fs');

var keystone = require('keystone');
async = require('async'), UserPhotoLike = keystone.list('UserPhotoLike'),
UserPhoto = keystone.list('UserPhoto'),
TttUser = keystone.list('TttUser');

var mysql = require('mysql'), mainPool = mysql.createPool(config.mysql.ttt);

var counter = 0;
function importUserPhotoLikeRow(userPhotoLike, next) {
  TttUser.model.findOne({
    $query : {'mysql_id' : userPhotoLike.friend_id},
    $orderby : {}
  }).exec(function(err, tttUser) {
    if(tttUser){
      UserPhoto.model.findOne({
        $query : {'mysql_id' : userPhotoLike.user_photo_id},
        $orderby : {}
      }).exec(function(err, userPhoto) {
        if(userPhoto){
          var newUserPhotoLike = {
              mysql_id : userPhotoLike.id,
              user_photo : userPhoto.id,
              author : tttUser.id,
              create_date : userPhotoLike.create_date
            };
      
            new UserPhotoLike.model(newUserPhotoLike).save(function(err) {
              if (err) {
                console.error(userPhotoLike);
                console.error(err);
              } else {
                logger.info(++counter);
                logger.info("Added userPhotoLike " + userPhotoLike.id
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
  UserPhotoLike.model
      .findOne({
        $query : {},
        $orderby : {
          _id : -1
        }
      })
      .exec(
          function(err, userPhotoLike) {
            var sql = 'select * from tbl_user_story_like where id > ? order by id asc limit 10000';
            var mysql_id = 0;
            if (userPhotoLike)
              mysql_id = userPhotoLike.mysql_id;
            var args = [ mysql_id ];

            mainPool.query(sql, args, function(err, data) {
              if (err) {
                console.dir(err);
              } else {
                async.forEach(data, importUserPhotoLikeRow, next);
              }
            });

          });
};
