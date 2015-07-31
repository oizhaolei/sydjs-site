var config = require('../config.json');
var logger = require('log4js').getLogger('updates/user-photos-translate.js');
var _ = require('lodash');
var fs = require('fs');

var keystone = require('keystone');
async = require('async'), UserPhotoTranslate = keystone.list('UserPhotoTranslate'),
UserPhoto = keystone.list('UserPhoto');

var mysql = require('mysql'), mainPool = mysql.createPool(config.mysql.ttt);

var counter = 0;
function importUserPhotoTranslateRow(userPhotoTranslate, next) {
  UserPhoto.model.findOne({
    $query : {'mysql_id' : userPhotoTranslate.user_photo_id},
    $orderby : {}
  }).exec(function(err, userPhoto) {
    if(userPhoto){
      var newUserPhotoTranslate = {
          mysql_id : userPhotoTranslate.id,
          content : userPhotoTranslate.to_content,
          lang : userPhotoTranslate.lang,
          user_photo : userPhoto.id,
          create_date : userPhotoTranslate.create_date
        };
  
        new UserPhotoTranslate.model(newUserPhotoTranslate).save(function(err) {
          if (err) {
            console.error(userPhotoTranslate);
            console.error(err);
          } else {
            logger.info(++counter);
            logger.info("Added UserPhotoTranslate " + userPhotoTranslate.id
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
  UserPhotoTranslate.model
      .findOne({
        $query : {},
        $orderby : {
          _id : -1
        }
      })
      .exec(
          function(err, UserPhotoTranslate) {
            var sql = 'select ust.* from tbl_user_story_translate ust, tbl_user_photo up where ust.user_photo_id = up.id and up.parent_id = 0 and ust.id > ? order by ust.id asc limit 10000';
            var mysql_id = 0;
            if (UserPhotoTranslate)
              mysql_id = UserPhotoTranslate.mysql_id;
            var args = [ mysql_id ];

            mainPool.query(sql, args, function(err, data) {
              if (err) {
                console.dir(err);
              } else {
                async.forEach(data, importUserPhotoTranslateRow, next);
              }
            });

          });
};
