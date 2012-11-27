/**
 * Log Catcher Bot - Listens for clients to request sending files up to the server and receives them.
 **/

 /*
 TODO

 */
/*jslint node: true, white: true */
/*global Buffer */
var settings = require('./settings');   // Our GoCast settings JS
if (!settings) {
    settings = {};
}
if (!settings.logcatcher) {
    settings.logcatcher = {};
}

var sys = require('util');
var xmpp = require('node-xmpp');
var fs = require('fs');
var ltx = require('ltx');

var argv = process.argv;

var GoCastJS = require('./gcall_node');
var argv = require('optimist')
    .usage('Prepare to receive inbound file-sharing files.\nUsage: $0 [--dest=destdirectory] [--link=linkdir] [--debugcommands]')
    .default('debugcommands', false)
    .boolean('debugcommands')
    .alias('d', 'dest')
    .alias('l', 'link')
    .describe('d', 'Location to store inbound files in - destdirectory/roomname/filename. If not specified, uses settings.filecatcher.dest')
    .describe('l', 'Link location for website to link to inbound files.')
    .describe('debugcommands', 'Allow direct chat to switchboard for backend commands.')
    .argv;

'use strict';


//
//
//  Main
//
//

console.log("****************************************************");
console.log("****************************************************");
console.log("*                                                  *");
console.log("STARTED FILECATCHER @ " + Date());
console.log("*                                                  *");
console.log("****************************************************");
console.log("****************************************************");

// Setup defaults
var debugCommands = argv.debugcommands;

//
// Local override via commandline options.
//
if (argv.dest) {
    settings.filecatcher.dest = argv.dest;
}

if (argv.link) {
    settings.filecatcher.link = argv.link;
}

var filecatcher = new GoCastJS.FileCatcher();
filecatcher.on('received', function(received) {
    console.log('FILECATCHER: RECEIVED FILE: ' + received);
});
filecatcher.on('tick', function(time) {
    console.log('TICK: ' + time);
});


