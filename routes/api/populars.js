"use strict";
/**
 * Module dependencies.
 */
var logger = require('log4js').getLogger('api/populars.js');
var config = require('../../config.json');

var async = require('async'),
    moment = require('moment'),
    keystone = require('keystone');

var UserPhoto = keystone.list('UserPhoto');

exports.name = 'popular';

exports.authorization = false;

exports.hot = function(req, res, next){
  var lastId = req.query.last_id;

  var query = UserPhoto.model.find().populate('author').limit(config.rows_per_page).sort({'_id': -1});
  if (lastId)
    query.where('_id').lt(lastId);
  query.exec(function(err, results) {
    UserPhoto.model.count().exec(function(err, count) {
      res.json( {
        data : results,
        rows_per_page : config.rows_per_page,
        count : count
      });
    });
  });
};

exports.photo = function(req, res, next){
  var photo_id = req.params.photo_id;
  var query = UserPhoto.model.findById(photo_id).populate('author');
  query.exec(function(err, userPhoto) {
    userPhoto.populateRelated('comments[author, translates]', function() {
      res.json(userPhoto);
    });
  });
};
