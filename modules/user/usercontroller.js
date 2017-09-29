'use strict';

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const ensureAuth = require('../middleware/authmiddleware').ensureAuth;
const User = require('../user/usermodel').User;
const cache = require('../../utils/cache');
const logger = require('../../utils/logger');

router.get('/allusers', cache.cache(20), function (req, res) {
	console.log('Ip address of client = ',req.ip);
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
			User.find({},{ "firstname":1, "lastname": 1, "email": 1} ).skip(skip).limit(limit).exec(function (err, allUsers) {
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
  },{ "firstname":1, "lastname": 1, "email": 1 } ).limit(50).exec(function (err, result) {
    if (err) {
      logger.error(err.stack);
      return res.status(500).send({ success: false, msg: 'Internal Server Error' })
    }
    else {
      return res.status(200).send({ success: true, msg: 'Search Users', data: result });
    }
  })
});

router.post('/updateProfile', validateUpdateUserData, function (req, res) {

	ensureAuth(req, res, function (payload) {

		let userId = payload.sub;
		let firstname = req.body.firstname;
		let lastname = req.body.lastname;
		let profile_image = req.body.profile_image;

		User.findByIdAndUpdate(userId, { $set: { 
			'firstname': firstname, 'lastname': lastname, profile_image: profile_image } 
		}, { new: true }, function (err, updated) {
			if (err) {
				logger.error(err.stack);
				return res.status(500).send({ success: false, msg: 'Internal Server Error' })
			}
			else {
				return res.status(200).send({ success: true, msg: 'User data updated', data: updated });
			}
		})
	});

});

router.get('/profile', function (req, res) {
	
		ensureAuth(req, res, function (payload) {
	
			let userId = payload.sub;
	
			User.findById(userId, function (err, foundUser) {
				if (err) {
					logger.error(err.stack);
					return res.status(500).send({ success: false, msg: 'Internal Server Error' })
				}
				else {
					return res.status(200).send({ success: true, msg: 'Found User', data: foundUser });
				}
			})
		});
	
	});

module.exports = router;

function validateUpdateUserData(req, res, next) {
	let userSchema = Joi.object().keys({
		firstname: Joi.string().min(3).max(30).required(),
		lastname: Joi.string().min(3).max(30).required(),
		profile_image: Joi.string().required(),
	});

	Joi.validate(req.body, userSchema, function (err, value) {
		if (err) {
			logger.error(err.stack);
			return res.status(400).send({ success: false, msg: 'Bad Request', error: err })
		}
		next();
	});
}
