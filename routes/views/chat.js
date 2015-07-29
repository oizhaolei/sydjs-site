"use strict";
var logger = require('log4js').getLogger('routes/vies/photo.js');
var keystone = require('keystone'),
    _ = require('underscore');

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res);

  view.render('site/chat');
};
