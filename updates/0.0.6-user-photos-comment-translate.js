var config = require('../config.json');
var logger = require('log4js').getLogger('updates/user-photos-comment-translate.js');
var _ = require('lodash');
var fs = require('fs');

var keystone = require('keystone');
async = require('async'), UserPhotoCommentTranslate = keystone.list('UserPhotoCommentTranslate'),
UserPhotoComment = keystone.list('UserPhotoComment');

var mysql = require('mysql'), mainPool = mysql.createPool(config.mysql.ttt);

var counter = 0;
function importUserPhotoCommentTranslateRow(userPhotoCommentTranslate, next) {
  UserPhotoComment.model.findOne({
    $query : {'mysql_id' : userPhotoCommentTranslate.user_photo_id},
    $orderby : {}
  }).exec(function(err, userPhotoComment) {
    if(userPhotoComment){
      var newUserPhotoCommentTranslate = {
          mysql_id : userPhotoCommentTranslate.id,
          content : userPhotoCommentTranslate.to_content,
          lang : userPhotoCommentTranslate.lang,
          user_photo_comment : userPhotoComment.id,
          create_date : userPhotoCommentTranslate.create_date
        };
  
        new UserPhotoCommentTranslate.model(newUserPhotoCommentTranslate).save(function(err) {
          if (err) {
            console.error(userPhotoCommentTranslate);
            console.error(err);
          } else {
            logger.info(++counter);
            logger.info("Added UserPhotoCommentTranslate " + userPhotoCommentTranslate.id
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
  UserPhotoCommentTranslate.model
      .findOne({
        $query : {},
        $orderby : {
          _id : -1
        }
      })
      .exec(
          function(err, UserPhotoCommentTranslate) {
            var sql = 'select ust.* from tbl_user_story_translate ust, tbl_user_photo up where ust.user_photo_id = up.id and up.parent_id > 0 and ust.id > ? order by ust.id asc limit 10000';
            var mysql_id = 0;
            if (UserPhotoCommentTranslate)
              mysql_id = UserPhotoCommentTranslate.mysql_id;
            var args = [ mysql_id ];

            mainPool.query(sql, args, function(err, data) {
              if (err) {
                console.dir(err);
              } else {
                async.forEach(data, importUserPhotoCommentTranslateRow, next);
              }
            });

          });
};
