var keystone = require('keystone'), Types = keystone.Field.Types;

/**
 * ChannelFollower Model ===========
 */

var ChannelFollower = new keystone.List('ChannelFollower', {
  nocreate : true
});

ChannelFollower.add({
  mysql_id : {
    type : Number,
    noedit : true
  },
  author : {
    type : Types.Relationship,
    ref : 'TttUser',
    index : true
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

ChannelFollower.schema.pre('save', function(next) {
  if (!this.isModified('create_date')) {
    this.create_date = Date.now();
  }
  keystone.list('Channel').model.findById(this.channel, function(err,channel) {
    if (channel) {
      channel.refreshChannelFollower();
    }
  });
  next();
});

/**
 * Registration ============
 */

ChannelFollower.defaultColumns = 'content, create_date|20%';
ChannelFollower.register();
