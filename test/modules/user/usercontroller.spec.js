'use strict';

var chai = require('chai');
var expect = chai.expect;
var request = require('supertest');
var app = require('../../../server');

describe('/Login API', function() {
  this.timeout(25000);
  it('it should have token', function(done){
    request(app)
    .post('/auth/login')
    .send({'email':'contactjittu@gmail.com','password':'123'})
    .expect(200)
    .end(function(err, res) {
      if (err) {
        return done(err);
      }
      expect(res.body.data.email).to.equal('contactjittu@gmail.com');
      done();
    });
  });
});