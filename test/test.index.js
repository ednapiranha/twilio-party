'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');

var TwilioParty = require('../index');
var tp;

var sid = 0;
var authToken = 0;
var phoneNumber = 0;
var phoneSalt = 0;

beforeEach(function() {
  tp = null;
});

describe('TwilioParty', function() {
  it('should add a new number without area code', function(done) {
    var phone = '5555555555';
    tp = new TwilioParty(sid, authToken, phoneNumber, phoneSalt);
    phone = '+1' + phone;
    tp.addNumber(phone, function(err) {
      should.exist(tp.numberList[phone]);
      tp.numberList[phone].pin.toString().should.have.a.lengthOf(4);
      should.exist(tp.numberList[phone].hashed);
      done();
    });
  });

  it('should add a new number with area code', function(done) {
    var phone = '+15555555555';
    tp = new TwilioParty(sid, authToken, phoneNumber, phoneSalt);
    tp.addNumber(phone, function(err) {
      should.exist(tp.numberList[phone]);
      tp.numberList[phone].pin.toString().should.have.a.lengthOf(4);
      should.exist(tp.numberList[phone].hashed);
      done();
    });
  });

  it('should expire the pin for a number', function(done) {
    var phone = '+15555555555';
    tp = new TwilioParty(sid, authToken, phoneNumber, phoneSalt);
    tp.ttl = 1;
    tp.addNumber(phone, function(err) {
      setTimeout(function() {
        should.not.exist(tp.cache.get(phone));
        done();
      }, 5);
    });
  });

  it('should validate a pin', function(done) {

  });
});