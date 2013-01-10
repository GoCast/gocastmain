/*jslint node: true, nomen: true, white: true */
/*global test, exec */

var settings;

try {
    settings = require('./settings');   // Our GoCast settings JS
} catch(e) {
    settings = require('../../settings');   // Look relative ... for developers on desktops.
}

if (!settings) {
    settings = {};
}
if (!settings.accounts) {
    settings.accounts = {};
}

'use strict';

var Mailgun = require('mailgun').Mailgun;

var mg = new Mailgun(settings.accounts.mailgunKey);

mg.sendText('The GoCast Team <rwolff@gocast.it>', ['Bob Wolff <bob.wolff68@gmail.com>', 'rwolff@gocast.it'],
  'Please validate your new GoCast account',
  'This is the text',
  'rwolff@gocast.it', {},
  function(err) {
    if (err) {
        console.log('Mail failed: ' + err);
    }
    else {
        console.log('Success');
    }
});
