'use strict';

const express = require('express'),
	router = express.Router(),
	Joi = require('joi'),
	User = require('../user/usermodel').User,
	jwt = require('jsonwebtoken'),
	config = require('../../config/config'),
	ensureAuth = require('../middleware/authmiddleware').ensureAuth,
	logger = require('../../utils/logger'),
	cache = require('../../utils/cache');

var secret = config.SECRET;

var createToken = function (user) {
	var payload = {
		sub: user._id,
		iat: Math.floor(Date.now() / 1000) - 30,
		exp: Math.floor(Date.now() / 1000) + 86400000
	};
	return jwt.sign(payload, secret);
}

var invalidateToken = function (user) {
	var payload = {
		sub: user._id,
		iat: Math.floor(Date.now() / 1000) - 30,
		exp: Math.floor(Date.now() / 1000) - 30
	};
	return jwt.sign(payload, secret);
}

router.post('/auth/signup', validateRequestForSignup, function (req, res) {
	var newuser = new User(req.body);
	newuser.save(function (err) {
		if (err) {
			logger.error(err.stack);
			return res.status(500).send({ message: 'Internal Server Error', err: err.stack })
		}
		return res.status(200).send({ message: 'Signup successfully' })
	});
});

router.post('/auth/login', validateRequestForLogin, function (req, res) {
	User.findOne({ email: req.body.email.toLowerCase() }, '+password', function (err, foundUser) {
		if (err) {
			logger.error(err.stack);
			return res.status(500).send({ message: 'Internal Server Error' })
		}
		else {
			if (foundUser) {
				foundUser.comparePassword(req.body.password, function (err, isMatch) {
					if (!isMatch) {
						return res.status(200).send({ message: 'Wrong email and password' })
					}
					else {
						var sendData = {};
						sendData.userId = foundUser._id;
						sendData.fistname = foundUser.fistname;
						sendData.lastname = foundUser.lastname;
						sendData.email = foundUser.email;
						return res.status(200).send(
							{
								message: 'Login successfull',
								token: createToken(foundUser),
								data: sendData
							});
					}
				})
			}
			else {
				return res.status(200).send({ message: 'Wrong email and password' })
			}
		}
	})
})

router.post('/auth/logout', function (req, res) {
	ensureAuth(req, res, function (payload) {
		User.findById(payload.sub, function (err, existingUser) {
			if (err) {
				logger.error(err.stack);
				return res.status(500).send({ message: 'Internal Server Error' })
			}
			else {
				if (existingUser) {
					return res.status(200).send({ message: 'logged Out', token: invalidateToken(existingUser) });
				}
				return res.status(200).send({ message: 'Not a user' });
			}
		})
	})
});


router.get('/allusers', cache.cache(20), function (req, res) {

	var items_perpage = req.query.itemsperpage || 5;
	var page = req.query.page || 1;

	var skip = items_perpage * (page - 1);
	var limit = parseInt(items_perpage);

	User.find().count(function (err, totalCount) {
		if (err) {
			logger.error(err.stack);
			return res.status(500).send({ message: 'Internal Server Error' })
		}
		else {
			User.find().skip(skip).limit(limit).exec(function (err, allUsers) {
				if (err) {
					logger.error(err.stack);
					return res.status(500).send({ message: 'Internal Server Error' })
				}
				else {
					var total = {}
					total.count = totalCount;
					if (total.count % items_perpage == 0) {
						total.pages = (total.count / items_perpage);
					}
					else {
						total.pages = (parseInt(total.count / items_perpage) + 1);
					}
					return res.status(200).send({ message: 'All users', total: total, data: allUsers });
				}
			});
		}	
	})	

});

router.get('/searchuser', function (req, res) {

  var username = req.query.matchelement;
  var regexStr = username.split(/ /).join("|"); 

  User.find({
    "$or": [
        { "firstname": { "$regex": regexStr, "$options": 'i' } },
        { "lastname": { "$regex": regexStr, "$options": 'i' }}
    ]
  }).limit(50).exec(function (err, result) {
    if (err) {
      logger.error(err.stack);
      return res.status(500).send({ message: 'Internal Server Error' })
    }
    else {
      return res.status(200).send({ message: 'Search Users', data: result });
    }
  })
});

module.exports = router;

function validateRequestForSignup(req, res, next) {
	var signupSchema = Joi.object().keys({
		firstname: Joi.string().min(3).max(30),
		lastname: Joi.string().min(3).max(30),
		email: Joi.string().email().required(),
		password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
	});

	Joi.validate(req.body, signupSchema, function (err, value) {
		if (err) {
			logger.error(err.stack);
			return res.status(400).send({ message: 'Bad Request', error: err })
		}
		next();
	});
}

function validateRequestForLogin(req, res, next) {
	var loginSchema = Joi.object().keys({
		email: Joi.string().email().required(),
		password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
	});

	Joi.validate(req.body, loginSchema, function (err, value) {
		if (err) {
			logger.error(err.stack);
			return res.status(400).send({ message: 'Bad Request', error: err })
		}
		next();
	});
}