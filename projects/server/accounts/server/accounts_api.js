/**
 * accounts_api - The highest-level API for doing account validation management.
 *
 * The webserver node-listener and the room manager will both utilize this API level.
 *
 **/

/*jslint node: true, nomen: true, white: true */
/*global test, exec */

var settings = require('./settings');   // Our GoCast settings JS
if (!settings) {
    settings = {};
}
if (!settings.roommanager) {
    settings.roommanager = {};
}

var sys = require('util');
var evt = require('events');

var eventManager = new evt.EventEmitter();
var argv = process.argv;

'use strict';

