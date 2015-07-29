var keystone = require('keystone'),
    async = require('async'),
    Types = keystone.Field.Types;

/**
 * TttUsers Model
 * ===========
 */

var TttUser = new keystone.List('TttUser', {
  track: true,
  autokey: { path: 'key', from: 'mysql_id', unique: true }
});

TttUser.add({
  mysql_id: { type: Number, noedit: true },
  password : { type: String, noedit: true },
  tel: { type: String, noedit: true },
  fullname: { type: String, noedit: true },
  balance: { type: Number, noedit: true },
  pic_url : { type: String},
  lang : { type: String, noedit: true },
  gender : { type: Number, noedit: true },
  create_date : { type: Types.Date, index: true }
});

/**
 * Hooks
 * =====
 */

TttUser.schema.pre('save', function(next) {
  if (!this.isModified('create_date')) {
    this.create_date = Date.now();
  }
  next();
});

/**
 * Registration
 * ============
 */

TttUser.defaultSort = '-create_date';
TttUser.defaultColumns = 'tel, state|20%, fullname|20%, create_date|20%';
TttUser.register();
