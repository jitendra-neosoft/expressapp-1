'use strict';

var chai = require('chai');
var expect = chai.expect;

var user = require('../../../modules/user/usermodel').User;

describe('user', function () {
  it('should be invalid if email is empty', function (done) {
    var newUser = new user();
    newUser.email = 'contactjittu@gmail.com';  
    newUser.validate(function (err) {
      if (err) {
        return done(err);
      }
      done();
    });
  });
});