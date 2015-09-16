'use strict';

var crypto = require('crypto');
var twilio = require('twilio');
var LRU = require('lru-cache');

var TwilioParty = function(sid, authToken, phoneNumber, phoneSalt) {
  this._sid = sid;
  this._authToken = authToken;
  this._phoneNumber = phoneNumber;
  this._phoneSalt = phoneSalt;
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
    if (number.match(/^[0-9]{10}$/)) {
      number = '+1' + number;
    } else if (number.indexOf('+') !== 0) {
      number = '+' + number;
    }

    return number;
  },

  _sendPin: function(number, next) {
    if (process.env.NODE_ENV === 'test') {
      return next(null, 'sent');
    }

    this._client.sendMessage({
      to: number,
      from: '+' + this._phoneNumber,
      body: this._numberList[number].pin
    }, function (err) {
      if (err) {
        console.error(err);
        return next(err);
      }

      next(null, 'sent');
    });
  },

  addNumber: function(number, next) {
    var pin = this._generatePin();
    number = this._validateNumber(number);

    this.cache.set(number, pin);

    this._numberList[number] = {
      pin: pin,
      hashed: crypto.createHash('sha1')
                    .update(this._phoneSalt + number).digest('hex')
    };

    this._sendPin(number, next);
  },

  validatePin: function(number, pin) {
    if (this.cache.get(number) && this.cache.get(number) == pin) {
      return true;
    }

    this.cache.del(number);
    delete this._numberList[number];
    return false;
  }
};

module.exports = TwilioParty;