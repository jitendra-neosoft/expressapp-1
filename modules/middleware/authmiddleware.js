'use strict';

const jwt = require('jsonwebtoken'),
	config = require('../../config/config'),
	logger = require('../../utils/logger');

module.exports.ensureAuth = function (req, res, next) {
	if (!req.headers.authorization) {
		return res.status(401).send({ message: 'Auth headers required' });
	}
	let token = req.headers.authorization.split(' ')[1];
	jwt.verify(token, config.SECRET, function (err, decoded) {
		if (err) {
			logger.error(err.stack);
			if (err.name === 'TokenExpiredError') {
				return res.status(401).send({ message: 'Auth token expired' });
			}
			if (err.name === 'JsonWebTokenError') {
				return res.status(401).send({ message: 'Invalid token' });
			}
			return res.status(401).send({ message: err.message });
		}
		next(decoded);
	});
}