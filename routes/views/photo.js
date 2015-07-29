"use strict";
var keystone = require('keystone'),
    _ = require('underscore');

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res);

  view.render('site/photos');
};


exports.show = function(req, res, next){
  var photo_id = req.params.photo_id;
  res.json( {
    photo_id : photo_id
  });
};
