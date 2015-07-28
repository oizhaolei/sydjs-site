var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * UserPhotoLikes Model
 * ===========
 */

var UserPhotoLike = new keystone.List('UserPhotoLike');

UserPhotoLike.add({
	userPhoto: { type: Types.Relationship, ref: 'UserPhoto', required: true, initial: true, index: true },
	who: { type: Types.Relationship, ref: 'User', required: true, initial: true, index: true },
	createdAt: { type: Date, noedit: true, collapse: true, default: Date.now },
	changedAt: { type: Date, noedit: true, collapse: true }
});


/**
 * Hooks
 * =====
 */

UserPhotoLike.schema.pre('save', function(next) {
	if (!this.isModified('changedAt')) {
		this.changedAt = Date.now();
	}
	next();
});

UserPhotoLike.schema.post('save', function() {
	keystone.list('UserPhoto').model.findById(this.userPhoto, function(err, userPhoto) {
		if (userPhoto) userPhoto.refreshUserPhotoLikes();
	});
});
UserPhotoLike.schema.post('remove', function() {
	keystone.list('UserPhoto').model.findById(this.userPhoto, function(err, userPhoto) {
		if (userPhoto) userPhoto.refreshUserPhotoLikes();
	});
});


/**
 * Registration
 * ============
 */

UserPhotoLike.defaultColumns = 'userPhoto, who, createdAt';
UserPhotoLike.defaultSort = '-createdAt';
UserPhotoLike.register();
