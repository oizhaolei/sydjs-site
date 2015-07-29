var config = require('../config.json');
var logger = require('log4js').getLogger('updates/user-photos-comment.js');
var _ = require('lodash');
var fs = require('fs');

var keystone = require('keystone');
async = require('async'), UserPhotoComment = keystone.list('UserPhotoComment');
UserPhoto = keystone.list('UserPhoto');

var mysql = require('mysql'), mainPool = mysql.createPool(config.mysql.ttt);

var counter = 0;
function importUserPhotoCommentRow(userPhotoComment, next) {
  console.log(userPhotoComment.parent_id);
  UserPhoto.model.findOne({
    $query : {'mysql_id' : userPhotoComment.parent_id},
    $orderby : {}
  }).exec(function(err, parentUserPhoto) {
    console.log(parentUserPhoto);
    if(parentUserPhoto){
      var newUserPhotoComment = {
          mysql_id : userPhotoComment.id,
          user_id : userPhotoComment.userid,
          content : userPhotoComment.content,
          lang : userPhotoComment.lang,
          user_photo : parentUserPhoto.id,
          create_date : userPhotoComment.create_date
        };
  
        new UserPhotoComment.model(newUserPhotoComment).save(function(err) {
          if (err) {
            console.error(userPhotoComment);
            console.error(err);
          } else {
            logger.info(++counter);
            console.log("Added userPhotoComment " + userPhotoComment.id
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
  UserPhotoComment.model
      .findOne({
        $query : {},
        $orderby : {
          _id : -1
        }
      })
      .exec(
          function(err, userPhotoComment) {
            var sql = 'select up.* from tbl_user_photo up where up.id > ? and up.parent_id > 0 order by up.id asc limit 10000';
            var mysql_id = 0;
            if (userPhotoComment)
              mysql_id = userPhotoComment.mysql_id;
            var args = [ mysql_id ];

            console.log(mysql_id);
            mainPool.query(sql, args, function(err, data) {
              if (err) {
                console.dir(err);
              } else {
                async.forEach(data, importUserPhotoCommentRow, next);
              }
            });

          });
};
