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

    // optional messaging that prepends the PIN when it is sent to a phone
    // e.g. This is your PIN: 1111
    tp.message = 'This is your PIN:';

    // Add the number - this will generate a PIN and send it as a text.
    tp.addNumber(phone, function(err) {
      // At this point the `phone` number will receive a pin. Enter that pin in the
      // call below. For example purposes, let's assume pin = 0000.
      var validate = tp.validatePin(phone, '0000');

      // `validate` will return either the phone hash or false - if it returns a
      // hash, you can store that as an identifier in your database.
    });

## Tests

    npm test

## License

BSD-3-Clause