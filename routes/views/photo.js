"use strict";
var logger = require('log4js').getLogger('routes/vies/photo.js');
var keystone = require('keystone'),
    _ = require('underscore');

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res);

  view.render('site/photos');
};


var UserPhoto = keystone.list('UserPhoto');

exports.show = function(req, res, next){
  var photo_id = req.params.photo_id;
  var view = new keystone.View(req, res),
      locals = res.locals;
  res.locals.photo_id = photo_id;
  view.render('site/photo');
};
