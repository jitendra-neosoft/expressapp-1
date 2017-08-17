'use strict';

require('dotenv').config();

module.exports = {
	SECRET : process.env.SECRET,
	PORT : process.env.PORT,
	MONGO_URI: process.env.MONGO_URI,
	NODE_ENV: process.env.NODE_ENV,
	CLUSTERING: false,
	MAIL: {
		EMAIL_ID: process.env.EMAIL_ID,
		EMAIL_PWD: process.env.EMAIL_PWD
	}
}