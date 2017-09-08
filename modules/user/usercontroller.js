'use strict';

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const ensureAuth = require('../middleware/authmiddleware').ensureAuth;
const User = require('../user/usermodel').User;
const cache = require('../../utils/cache');
const logger = require('../../utils/logger');

router.get('/', function (req, res) {
	ensureAuth(req, res, function (payload) {
		return res.status(200).send({ success: true, msg: 'I am authenticated', data: payload })
	})
});

router.get('/allusers', cache.cache(20), function (req, res) {

	let items_perpage = req.query.itemsperpage || 5;
	let page = req.query.page || 1;

	let skip = items_perpage * (page - 1);
	let limit = parseInt(items_perpage);

	User.find().count(function (err, totalCount) {
		if (err) {
			logger.error(err.stack);
			return res.status(500).send({ success: false, msg: 'Internal Server Error' })
		}
		else {
			User.find().skip(skip).limit(limit).exec(function (err, allUsers) {
				if (err) {
					logger.error(err.stack);
					return res.status(500).send({ success: false, msg: 'Internal Server Error' })
				}
				else {
					let total = {}
					total.count = totalCount;
					if (total.count % items_perpage == 0) {
						total.pages = (total.count / items_perpage);
					}
					else {
						total.pages = (parseInt(total.count / items_perpage) + 1);
					}
					return res.status(200).send({ success: true, msg: 'All users', total: total, data: allUsers });
				}
			});
		}	
	})	

});

router.get('/searchuser', function (req, res) {

	let username = req.query.matchelement;
	if(!username){
		return res.status(400).send({ success: false, msg: 'Bad Request' })
	}
  let regexStr = username.split(/ /).join("|"); 

  User.find({
    "$or": [
        { "firstname": { "$regex": regexStr, "$options": 'i' } },
        { "lastname": { "$regex": regexStr, "$options": 'i' }}
    ]
  }).limit(50).exec(function (err, result) {
    if (err) {
      logger.error(err.stack);
      return res.status(500).send({ success: false, msg: 'Internal Server Error' })
    }
    else {
      return res.status(200).send({ success: true, msg: 'Search Users', data: result });
    }
  })
});

module.exports = router;