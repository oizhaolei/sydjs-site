var keystone = require('keystone'),
    Types = keystone.Field.Types;

/**
 * UserStoryTranslates Model
 * ===========
 */

var UserStoryTranslate = new keystone.List('UserStoryTranslate');

UserStoryTranslate.add({
  userPhoto: { type: Types.Relationship, ref: 'UserPhoto', required: true, initial: true, index: true },
  who: { type: Types.Relationship, ref: 'User', required: true, initial: true, index: true },
  lang: { type: Types.Select, options: [
    { label: 'English', value: 'EN' },
    { label: 'Chinese', value: 'CN' },
    { label: 'Japanese', value: 'JP' },
    { label: 'Korean', value: 'KR' }
  ] },
  to_content: { type: String, required: true, initial: true },
  good : { type: Number, noedit: true },
  createdAt: { type: Date, noedit: true, collapse: true, default: Date.now },
  changedAt: { type: Date, noedit: true, collapse: true }
});


/**
 * Hooks
 * =====
 */

UserStoryTranslate.schema.pre('save', function(next) {
  if (!this.isModified('changedAt')) {
    this.changedAt = Date.now();
  }
  next();
});


/**
 * Registration
 * ============
 */

UserStoryTranslate.defaultColumns = 'userPhoto, who, createdAt';
UserStoryTranslate.defaultSort = '-createdAt';
UserStoryTranslate.register();
