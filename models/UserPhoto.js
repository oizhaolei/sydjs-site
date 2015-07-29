var keystone = require('keystone'),
    async = require('async'),
    Types = keystone.Field.Types;

/**
 * UserPhotos Model
 * ===========
 */

var UserPhoto = new keystone.List('UserPhoto', {
  map: { name: 'title' },
  track: true,
  autokey: { path: 'key', from: 'mysql_id', unique: true }
});

UserPhoto.add({
  mysql_id: { type: Number, noedit: true },
  author : { type: Types.Relationship, ref: 'TttUser', index: true },
  channels: { type: Types.Relationship, ref: 'PostCategory', many: true },
  pic_url: { type: String },
  content: { type: String },
  lang: { type: Types.Select, options: [
    'EN','KR','CN','JP','ID','TL','VI','TH','af','sq','ar','az','eu','bn','be','bg','ca','hr','cs','da','nl','eo','et','fi','fr','gl','ka','de','el','gu','ht','iw','hi','hu','is','ga','it','kn','la','lv','lt','mk','ms','mt','no','fa','pl','pt','ro','ru','sr','sk','sl','es','sw','sv','ta','te','tr','uk','ur','cy','th'
  ] },
  address: { type: String },
  late6 : { type: Number, noedit: true },
  lnge6 : { type: Number, noedit: true },
  width : { type: Number, noedit: true },
  height : { type: Number, noedit: true },
  good : { type: Number, noedit: true },
  present : { type: Number, noedit: true },
  comment : { type: Number, noedit: true },
  chosen : { type: Number, noedit: true },
  create_date : { type: Types.Date, index: true }
});

/**
 * Virtuals
 * ========
 */


/**
 * Relationships
 * =============
 */

UserPhoto.relationship({ ref: 'UserPhotoComment', refPath: 'user_photo', path: 'comments' });


/**
 * Methods
 * =============
 */
UserPhoto.schema.methods.refreshUserPhotoComments = function(callback) {

  var userPhoto = this;

  keystone.list('UserPhotoComment').model.count()
    .where('user_photo').in([userPhoto.id])
    .exec(function(err, count) {
      if (err) return callback(err);
      console.log('refreshUserPhotoComments:' + count);
      userPhoto.comment = count;
      userPhoto.save(callback);

    });
};

UserPhoto.schema.methods.refreshUserPhotoLikes = function(callback) {

  var userPhoto = this;

  keystone.list('UserPhotoLike').model.count()
    .where('userPhoto').in([userPhoto.id])
    .exec(function(err, count) {

      if (err) return callback(err);

      userPhoto.good = count;
      userPhoto.save(callback);

    });
};

UserPhoto.schema.methods.notifyAdmins = function(callback) {

  var photo = this;

  // Method to send the notification email after data has been loaded
  var sendEmail = function(err, results) {

    if (err) return callback(err);

    async.each(results.admins, function(admin, done) {

      new keystone.Email('admin-notification-new-photo').send({
	admin: admin.name.first || admin.name.full,
	author: results.author ? results.author.name.full : 'Somebody',
	title: photo.title,
	keystoneURL: 'http://www.sydjs.com/keystone/photo/' + photo.id,
	subject: 'New UserPhoto to SydJS'
      }, {
	to: admin,
	from: {
	  name: 'SydJS',
	  email: 'contact@sydjs.com'
	}
      }, done);

    }, callback);

  };

  // Query data in parallel
  async.parallel({
    author: function(next) {
      if (!photo.author) return next();
      keystone.list('User').model.findById(photo.author).exec(next);
    },
    admins: function(next) {
      keystone.list('User').model.find().where('isAdmin', true).exec(next);
    }
  }, sendEmail);

};



/**
 * Hooks
 * =====
 */

UserPhoto.schema.pre('save', function(next) {
  if (!this.isModified('create_date')) {
    this.create_date = Date.now();
  }
  next();
});

UserPhoto.schema.post('save', function() {});

UserPhoto.schema.post('remove', function() {
  keystone.list('UserPhoto').model.findById(this.parent, function(err,parentUserPhoto) {
    if (parentUserPhoto) parentUserPhoto.refreshUserPhotoComments();
  });
});


/**
 * Registration
 * ============
 */

UserPhoto.defaultSort = '-create_date';
UserPhoto.defaultColumns = 'title, state|20%, author|20%, create_date|20%';
UserPhoto.register();
