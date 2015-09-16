# Twilio Party

Use Twilio to authenticate and generate a PIN to verify.

## Usage

    var TwilioParty = require('twilio-party');

    var sid = <your twilio sid>;
    var authToken = <your twilio token>;
    var phoneNumber = <your twilio number>;
    var phoneSalt = <a random string>;

    var phone = '5555555'; // a phone number you are trying to authenticate

    var tp = new TwilioParty(sid, authToken, phoneNumber, phoneSalt);

    tp.addNumber(phone, function(err) {
      // At this point the `phone` number will receive a pin. Enter that pin in the
      // call below. For example purposes, let's assume pin = 0000.
      var validate = tp.validatePin(phone, '0000');

      // `validate` will return either the phone hash or false - if it returns a
      // hash, you can store that as an identifier in your database.
    });