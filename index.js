'use strict';

const crypto = require('crypto');
const twilio = require('twilio');
const LRU = require('lru-cache');

let TwilioParty = function(sid, authToken, phoneNumber, phoneSalt) {
  this._sid = sid;
  this._authToken = authToken;
  this._phoneNumber = phoneNumber;
  this._phoneSalt = phoneSalt;
  this.message = false;
  this._ttl = 1000 * 60 * 5; // 5 min

  if (process.env.NODE_ENV !== 'test') {
    this._client = twilio(this._sid, this._authToken);
  }

  this.cache = LRU({
    max: 500,
    maxAge: this._ttl
  });

  this._numberList = {};
};

TwilioParty.prototype = {
  get numberList() {
    return this._numberList;
  },

  set ttl(limit) {
    this._ttl = limit;
    this.cache = LRU({
      max: 500,
      maxAge: limit
    });
  },

  _generatePin: function() {
    return Math.floor(Math.random() * (10000 - 1111 + 1) + 1111);
  },

  _validateNumber: function(number) {
    number = number.replace(/[^0-9\+]/gi, '');
    if (number.match(/^[0-9]{10}$/)) {
      number = '+1' + number;
    } else if (number.indexOf('+') !== 0) {
      number = '+' + number;
    }

    return number;
  },

  _sendPin: function(number, next) {
    const body = this.cache.get(number);

    if (process.env.NODE_ENV === 'test') {
      return next(null, 'sent');
    }

    if (this.message) {
      body = this.message + ' ' + body;
    }

    this._client.sendMessage({
      to: number,
      from: '+' + this._phoneNumber,
      body: body
    }, function (err) {
      if (err) {
        console.error(err);
        return next(err);
      }

      next(null, 'sent');
    });
  },

  addNumber: function(number, next) {
    const pin = this._generatePin();
    number = this._validateNumber(number);

    this.cache.set(number, pin);

    this._numberList[number] = {
      hashed: crypto.createHash('sha1')
                    .update(this._phoneSalt + number).digest('hex')
    };

    this._sendPin(number, next);
  },

  validatePin: function(number, pin) {
    if (this.cache.get(number) && this.cache.get(number) == pin) {
      return this._numberList[number].hashed;
    }

    this.cache.del(number);
    delete this._numberList[number];
    return false;
  }
};

module.exports = TwilioParty;
