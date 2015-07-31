var keystone = require('keystone'), Types = keystone.Field.Types;

/**
 * UserPhotoLikes Model ===========
 */

var UserPhotoLike = new keystone.List('UserPhotoLike');

UserPhotoLike.add({
  user_photo : {
    type : Types.Relationship,
    ref : 'UserPhoto',
    index : true
  },
  author : {
    type : Types.Relationship,
    ref : 'TttUser',
    index : true
  },
  create_date : {
    type : Types.Date,
    index : true
  }
});

/**
 * Hooks =====
 */

UserPhotoLike.schema.pre('save', function(next) {
  if (!this.isModified('create_date')) {
    this.create_date = Date.now();
  }
  keystone.list('UserPhoto').model.findById(this.user_photo, function(err,parentUserPhoto) {
    if (parentUserPhoto) {
      parentUserPhoto.refreshUserPhotoLikes();
    }
  });
  next();
});

/**
 * Registration ============
 */
UserPhotoLike.defaultColumns = 'content, create_date|20%';
UserPhotoLike.register();
