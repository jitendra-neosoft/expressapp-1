'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const logger = require('../../utils/logger');

module.exports.ensureAuth = function (req, res, next) {
	if (!req.headers.authorization) {
		return res.status(401).send({ success: false, msg: 'Auth headers required' });
	}
	let token = req.headers.authorization.split(' ')[1];
	jwt.verify(token, config.SECRET, function (err, decoded) {
		if (err) {
			logger.error(err.stack);
			if (err.name === 'TokenExpiredError') {
				return res.status(401).send({ success: false, msg: 'Auth token expired' });
			}
			if (err.name === 'JsonWebTokenError') {
				return res.status(401).send({ success: false, msg: 'Invalid token' });
			}
			return res.status(401).send({ success: false, msg: err.message });
		}
		next(decoded);
	});
}