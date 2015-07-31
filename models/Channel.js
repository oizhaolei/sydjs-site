var keystone = require('keystone'),
    async = require('async'),
    Types = keystone.Field.Types;

/**
 * Channels Model
 * ===========
 */

var Channel = new keystone.List('Channel', {
  map: { name: 'title' },
  track: true,
  autokey: { path: 'key', from: 'mysql_id', unique: true }
});

Channel.add({
  mysql_id: { type: Number, noedit: true },
  pic_url : { type: String, noedit: true },
  follower_count: { type: Number, noedit: true },
  popular_count: { type: Number, noedit: true },
  recommend: { type: Number, noedit: true },
  create_date : { type: Types.Date, index: true }
});

/**
 * Relationships
 * =============
 */

Channel.relationship({ ref: 'ChannelFollower', refPath: 'channel', path: 'followers' });
Channel.relationship({ ref: 'ChannelTranslate', refPath: 'channel', path: 'translates' });
Channel.relationship({ ref: 'UserPhoto', refPath: 'channel', path: 'userPhotos' });

/**
 * Methods
 * =============
 */
Channel.schema.methods.refreshChannelFollower = function(callback) {

  var channel = this;

  keystone.list('ChannelFollower').model.count()
    .where('channel').in([channel.id])
    .exec(function(err, count) {
      if (err) return callback(err);
      console.log('refreshChannelFollower:' + count);
      channel.follower_count = count;
      channel.save(callback);

    });
};

Channel.schema.methods.refreshChannelPopular = function(callback) {

  var channel = this;

  keystone.list('UserPhoto').model.count()
    .where('channel').in([channel.id])
    .exec(function(err, count) {
      if (err) return callback(err);
      console.log('refreshChannelPopular:' + count);
      channel.popular_count = count;
      channel.save(callback);

    });
};

/**
 * Hooks
 * =====
 */

Channel.schema.pre('save', function(next) {
  if (!this.isModified('create_date')) {
    this.create_date = Date.now();
  }
  next();
});

/**
 * Registration
 * ============
 */

Channel.defaultSort = '-create_date';
Channel.defaultColumns = 'pic_url|20%, create_date|20%';
Channel.register();
