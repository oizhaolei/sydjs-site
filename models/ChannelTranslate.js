var keystone = require('keystone'), Types = keystone.Field.Types;

/**
 * ChannelTranslate Model ===========
 */

var ChannelTranslate = new keystone.List('ChannelTranslate', {
  nocreate : true
});

ChannelTranslate.add({
  mysql_id : {
    type : Number,
    noedit : true
  },
  title : {
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
  channel : {
    type : Types.Relationship,
    ref : 'Channel',
    index : true
  }
});

/**
 * Hooks =====
 */

ChannelTranslate.schema.pre('save', function(next) {
  if (!this.isModified('create_date')) {
    this.create_date = Date.now();
  }
  next();
});

ChannelTranslate.defaultColumns = 'content, create_date|20%';
ChannelTranslate.register();
