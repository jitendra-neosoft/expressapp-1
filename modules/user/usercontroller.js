'use strict';

const express = require('express'),
	router = express.Router(),
	ensureAuth = require('../middleware/authmiddleware').ensureAuth;

router.get('/', function (req, res) {
	ensureAuth(req, res, function (payload) {
		return res.status(200).send({ message: 'I am authenticated', data: payload })
	})
});

module.exports = router;