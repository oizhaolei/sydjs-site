var keystone = require('keystone'), Types = keystone.Field.Types;

/**
 * UserPhotoCommentTranslate Model ===========
 */

var UserPhotoCommentTranslate = new keystone.List('UserPhotoCommentTranslate',
    {
      nocreate : true
    });

UserPhotoCommentTranslate.add({
  mysql_id : {
    type : Number,
    noedit : true
  },
  content : {
    type : String,
    noedit : true
  },
  lang : {
    type : Types.Select,
    options : [ 'EN', 'KR', 'CN', 'JP', 'ID', 'TL', 'VI', 'TH', 'af', 'sq',
        'ar', 'az', 'eu', 'bn', 'be', 'bg', 'ca', 'hr', 'cs', 'da', 'nl', 'eo',
        'et', 'fi', 'fr', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'iw', 'hi', 'hu',
        'is', 'ga', 'it', 'kn', 'la', 'lv', 'lt', 'mk', 'ms', 'mt', 'no', 'fa',
        'pl', 'pt', 'ro', 'ru', 'sr', 'sk', 'sl', 'es', 'sw', 'sv', 'ta', 'te',
        'tr', 'uk', 'ur', 'cy', 'th' ]
  },
  create_date : {
    type : Types.Date,
    index : true
  },
  user_photo_comment : {
    type : Types.Relationship,
    ref : 'UserPhotoCommentTranslate',
    index : true
  }
});

/**
 * Hooks =====
 */

UserPhotoCommentTranslate.schema.pre('save', function(next) {
  if (!this.isModified('create_date')) {
    this.create_date = Date.now();
  }
  next();
});

UserPhotoCommentTranslate.defaultColumns = 'content, create_date|20%';
UserPhotoCommentTranslate.register();
