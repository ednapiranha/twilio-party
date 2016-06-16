'use strict';

process.env.NODE_ENV = 'test';

const should = require('should');

const TwilioParty = require('../index');
let tp;

let sid = 0;
let authToken = 0;
let phoneNumber = 0;
let phoneSalt = 0;

beforeEach(() => {
  tp = null;
});

describe('TwilioParty', () => {
  it('should add a new number without area code', (done) => {
    let phone = '5555555555';
    tp = new TwilioParty(sid, authToken, phoneNumber, phoneSalt);
    phone = '+1' + phone;
    tp.addNumber(phone, (err) => {
      should.exist(tp.numberList[phone]);
      tp.cache.get(phone).toString().should.have.a.lengthOf(4);
      should.exist(tp.numberList[phone].hashed);
      done();
    });
  });

  it('should add a new number with area code', (done) => {
    let phone = '+15555555555';
    tp = new TwilioParty(sid, authToken, phoneNumber, phoneSalt);
    tp.addNumber(phone, function(err) {
      should.exist(tp.numberList[phone]);
      tp.cache.get(phone).toString().should.have.a.lengthOf(4);
      should.exist(tp.numberList[phone].hashed);
      done();
    });
  });

  it('should expire the pin for a number', (done) => {
    let phone = '+15555555555';
    tp = new TwilioParty(sid, authToken, phoneNumber, phoneSalt);
    tp.ttl = 1;
    tp.addNumber(phone, (err) => {
      setTimeout(() => {
        should.not.exist(tp.cache.get(phone));
        done();
      }, 5);
    });
  });

  it('should validate a correct pin', (done) => {
    let phone = '+15555555555';
    tp = new TwilioParty(sid, authToken, phoneNumber, phoneSalt);
    tp.addNumber(phone, (err) => {
      let validate = tp.validatePin(phone, tp.numberList[phone].pin);

      validate.should.match(/[A-Z0-9]/i);
      done();
    });
  });

  it('should validate an incorrect pin', (done) => {
    let phone = '+15555555555';
    tp = new TwilioParty(sid, authToken, phoneNumber, phoneSalt);
    tp.addNumber(phone, (err) => {
      let validate = tp.validatePin(phone, '0');

      validate.should.equal(false);
      should.not.exist(tp.cache.get(phone));
      should.not.exist(tp.numberList[phone]);
      done();
    });
  });
});
