# expressapp
> User Authentication using JWT JSON WebToken in Node.js using Express, Used Joi for user input validation, mongoose for ORM, Winston for error logging, Nodemailer for send email after crashing the Server, memory-cache for caching the data on RAM

## Installation

```sh
npm install
```

## Setup
Create .env file on root directory and add the below code
```sh
SECRET = AIzaSyAQfxPJiounkhOjODEO5ZieffeBv6yft2Q
PORT = 3003
MONGO_URI = mongodb://localhost:27017/expressapp
NODE_ENV = development
EMAIL_ID = example@example.com
EMAIL_PWD = example
```

## Start an app

```sh
npm start
```

### *API Available*

###### *Signup User*

	POST: http://localhost:3003/auth/signup

	{
		"firstname": "Jitendra",
		"lastname": "Kumar",
		"email": "contactjittu@gmail.com",
    "password":"123"
	}
  
###### *Login User*

	POST: http://localhost:3003/auth/login

	{
		"email": "contactjittu@gmail.com",
		"password": "123"
	}

###### *Search Users*

	GET: http://localhost:3003/searchuser?matchelement=jitendra
  
###### *Get all Users*

	GET: http://localhost:3003/allusers?itemsperpage=10&page=1
