/*jslint node: true, nomen: true, white: true */
/*global test, exec */

var sys = require('util');
var fs = require('fs');
var ltx = require('ltx');
var db = require('./server/accounts_db');
var async = require('async');

'use strict';

var buf, xmppAccounts, matched, k;


function loadXML(name) {
    var thefile;
    try {
        thefile = fs.readFileSync(name);
        return thefile;
    }
    catch (e) {
        console.log('ERROR: Could not load xml file: ' + name + ' Err: ' + e);
    }

    return false;
}

function parseXML(xml) {
    var k, par = new ltx.parse(xml),
    users = par.getChildren('User'),
    accounts = [], username, name;

    console.log('#users found: ', users.length);

    for (k in users)
    {
        if (users.hasOwnProperty(k)) {
            username = users[k].getChildText('Username');
            name = users[k].getChildText('Name');
//            console.log('Username: ', users[k].getChildText('Username'), ', Name: ', users[k].getChildText('Name'));
            if (username.match(/~/) && name) {
                accounts.push({username: username.replace('~', '@'), name: name});
            }
//            else {
//                console.log('Skipping ', username, ', ', name);
//            }

//            this.static_roomnames[rooms[k].attrs.jid.split('@')[0]] = true;
        }
    }

    return accounts;
}

function processOne(obj, cb) {
    var k = obj.username;
    console.log('Processing: ' + k);

    db.GetEntryByAccountName(k, function(entry) {
        if (entry.name) {
            // User has a name in the DynamoDB. Let's see if it matches.
            if (entry.name !== obj.name) {
                console.log('Mis-Match: Skipping Username: ' + k + ' - Name-mismatch. XMPP: "' + obj.name + '", DynamoDB: "' + entry.name + '"');
            }
            else {
                matched += 1;
//                console.log('MATCH: Skipping for: ' + k);
            }

            cb();
        }
        else {
//            console.log('NULLIFIED - Would be entering a name for: ' + k);
            console.log('Updating record for: ' + k);
            db.UpdateEntry(k, {name: obj.name}, function() {
//                console.log('Completed update for: ' + k);
                cb();
            }, function(err) {
                cb(err);
            });
        }
    }, function(err) {
        console.log('Error: ', err);
        cb(err);
    });
}

if (process.argv.length > 2) {
    console.log('Loading xml file: ' + process.argv[2]);
    buf = loadXML(process.argv[2]);
    // Need to convert it to a text string for parsing.
    xmppAccounts = parseXML(buf.toString());
    matched = 0;
//    console.log(xmppAccounts);
//    process.exit(0);

    async.forEachSeries(xmppAccounts, processOne, function(err) {
        console.log('Complete. # of accounts which were skipped because the name already matched: ' + matched);
    });
}
else {
    console.log('Please provide the source .xml file name.');
    process.exit(-1);
}
