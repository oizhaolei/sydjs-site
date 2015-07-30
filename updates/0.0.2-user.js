"use strict";
var config = require('../config.json');
var logger = require('log4js').getLogger('updates/user.js');
var _ = require('lodash');
var fs = require('fs');

var keystone = require('keystone'),
    async = require('async'),
    TttUser = keystone.list('TttUser');

var mysql = require('mysql'),
    mainPool = mysql.createPool(config.mysql.ttt);

var counter = 0;
function importTttUserRow(user, next) {

  var newTttUser  = {
    mysql_id : user.id,
    password : user.password,
    tel : user.tel,
    fullname : user.fullname,
    balance : user.balance,
    pic_url : user.pic_url,
    lang : user.lang,
    gender : user.gender,
    create_date : user.create_date
  };

  new TttUser.model(newTttUser).save(function(err) {
    if (err) {
      console.error(user);
      console.error(err);
    } else {
      logger.info(++counter);
      logger.info("Added user " + user.id + " to the database.");
    }
    next();
  });
}

exports = module.exports = function(next) {
  TttUser.model.findOne({$query:{},$orderby:{_id:-1}}).exec(function(err, TttUser) {
    var sql = 'select * from tbl_user where id > ? order by id asc limit 10000';
    var mysql_id = 0;
    if (TttUser) mysql_id = TttUser.mysql_id;
    var args = [ mysql_id];

    logger.info(mysql_id);
    mainPool.query(sql, args, function(err, data) {
      if (err) {
        console.dir(err);
      } else {
        async.forEach(data, importTttUserRow, next);
      }
    });

  });
};
