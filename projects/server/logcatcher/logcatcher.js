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
var gcutil = require('./gcutil_node');
var gcibb = require('./ibb_node');

var argv = process.argv;

'use strict';

///
///
///
///  L O G C A T C H E R
///
///
///

function LogCatcher(user, pw, notifier) {
    this.SERVER = settings.SERVERNAME;

    this.client = new xmpp.Client({ jid: user, password: pw, reconnect: true, host: this.SERVER, port: settings.SERVERPORT });
    this.notifier = notifier;

    this.iqnum = 0;
    this.iq_callbacks = {};
    this.IBB = new gcibb.IBBTransfer(this.client, notifier);

    var self = this;

    this.client.on('online', function() {
        // Mark ourself as online so that we can receive messages from direct clients.
        self.client.send(new xmpp.Element('presence'));

        self.log("Listening for logcatcher queries.");
    });

    this.client.on('offline', function() {
//      self.log('Switchboard went offline. Reconnection should happen automatically.');
    });

    //
    // Now once we're online, we need to handle all incoming from each room.
    this.client.on('stanza', function(in_stanza) {
        var stanza = in_stanza.clone();

        if (stanza.is('message') && stanza.attrs.type !== 'error') {
            self.handleMessage(stanza);
        }
        else if (stanza.is('presence')) {
            self.handlePresence(stanza);
        }
        else if (stanza.is('iq') && stanza.attrs.type !== 'error') {
            self.handleIq(stanza);
        }
        else {
            self.log("UNHANDLED: " + stanza.tree());
        }
    });

    this.client.on('error', function(e) {
        sys.puts(e);
        if (self.notifier) {
            self.notifylog(e.toString());
        }
    });

}

LogCatcher.prototype.notifylog = function(msg) {
    if (this.notifier) {
        this.notifier.sendMessage(gcutil.logDate() + " - LogCatcher: " + msg);
    }
};

LogCatcher.prototype.log = function(msg) {
    console.log(gcutil.logDate() + " - LogCatcher: " + msg);
};

LogCatcher.prototype.sendIQ = function(iq, cb) {
    var iqid = "logcatcher_iqid" + this.iqnum,
        self = this;

    this.iqnum += 1;

    if (!iq.root().is('iq'))
    {
        this.log("sendIQ - malformed inbound iq message. No <iq> stanza: " + iq.tree());
        return;
    }

    // Add in our ever-increasing room-based id.
    iq.root().attr('id', iqid);

    if (cb) {
        this.iq_callbacks[iqid] = cb;
    }

    this.client.send(iq.root());
};

LogCatcher.prototype.sendPrivateMessage = function(tojid, msg) {
    if (this.client)
    {
        var msg_stanza = new xmpp.Element('message', {to: tojid, type: 'chat'})
            .c('body').t(msg);
        this.client.send(msg_stanza);
    }
    else {
        this.log("ERROR: Client invalid.");
    }
};

//
// \brief Need to check the room's banned-list for this person.
//
LogCatcher.prototype.handleMessage = function(msg) {
    var k, cmd;
    // Listen to pure chat messages to the LogCatcher.
    // TODO: Make these into IQ messages to listen to since they require a 'result' back.

    //
    // Look for direct chats only.
    //
    if (msg.attrs.type === 'chat')
    {
//      this.log("DEBUG: InMsg: " + msg);

        // Don't listen to delayed messages.
        if (msg.getChild('body') && msg.getChild('body').getText() && !msg.getChild('delay'))
        {
            // Now we need to split the message up and trim spaces just in case.
            cmd = msg.getChild('body').getText().split(';');
            for (k in cmd) {
                if (cmd.hasOwnProperty(k)) {
                    cmd[k] = cmd[k].trim();
                }
            }

            cmd[0] = cmd[0].toUpperCase();
/*          if (cmd[0] === 'INTRO_SR')
                this.intro_sr(msg.attrs.from, cmd[1]);
            else */
            switch (cmd[0]) {
            case 'DUMPHISTORY':
                if (this.IBB) {
                    this.sendPrivateMessage(msg.attrs.from, 'History: ' + this.IBB.DumpHistory());
                }
                break;
            case 'DUMPACTIVE':
            case 'DUMPACTIVETRANSFERS':
                if (this.IBB) {
                    this.sendPrivateMessage(msg.attrs.from, 'Active: ' + this.IBB.DumpActiveTransfers());
                }
                break;
            default:
                this.log("Direct message: Unknown command: " + msg.getChild('body').getText());
                break;
            }
        }
    }
};

//
// At this level, we only want to handle presence at the server level.
// This means only listen to presence from jids with no username.
//
LogCatcher.prototype.handlePresence = function(pres) {
    this.log(pres);
};

LogCatcher.prototype.handleIq = function(iq) {
    var iqid, callback;

    if (!iq.attrs.from) {
        console.log('ERROR: malformed IQ - ', iq);
        return;
    }

    // Handle all pings and all queries for #info
    if (iq.attrs.type === 'result' && iq.attrs.id && this.iq_callbacks[iq.attrs.id])
    {
        iqid = iq.attrs.id;
        callback = this.iq_callbacks[iqid];

        // Need to be sure to not use values from 'iq' after the callback.
        // As the callback itself can modify iq and sometimes does.
        delete this.iq_callbacks[iqid];
        // We have a callback to make on this ID.
        callback.call(this, iq);
    }
    else if (iq.getChild('ping')
        || (iq.getChild('query') && iq.getChildByAttr('xmlns','http://jabber.org/protocol/disco#info')))
    {
        iq.attrs.to = iq.attrs.from;
        delete iq.attrs.from;
        iq.attrs.type = 'result';

        if (iq.getChild('ping')) {
            iq.remove('ping');
        }
//          console.log("Sending pong/result: " + iq);
        this.client.send(iq);
    }
    else if (iq.attrs.type === 'set' && iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb')) {
        // We have an inbound IBB log request.
        if (this.IBB) {
            this.IBB.ProcessIQ(iq);
        }

    }
    else if (!iq.attrs.from.split('@')) {
        this.log("UNHANDLED IQ: " + iq);
    }
};

function Notifier(serverinfo, jidlist) {
    var users, k, self = this;

    this.server = serverinfo.server || "video.gocast.it";
    this.port = serverinfo.port || 5222;
    this.jid = serverinfo.jid;
    this.password = serverinfo.password;

    this.informlist = jidlist;
    this.isOnline = false;

    console.log(gcutil.logDate() + " - Notifier started:");
    users = "  Users to notify: ";

    for (k in this.informlist)
    {
        if (this.informlist.hasOwnProperty(k)) {
            if (users !== "  Users to notify: ") {
                users += ", ";
            }

            users += this.informlist[k];
        }
    }
    console.log(users);

    this.client = new xmpp.Client({ jid: this.jid, password: this.password, reconnect: true, host: this.server, port: this.port });

    this.client.on('online',
          function() {
//          if (!self.isOnline)
//              console.log(gcutil.logDate() + " - Notifier online.");
            self.isOnline = true;
//          self.sendMessage("Notifier online.");
          });

    this.client.on('offline',
          function() {
//          console.log(gcutil.logDate() + " - Notifier offline.");
            self.isOnline = false;
          });

    this.client.on('error', function(e) {
        sys.puts(e);
    });

}

Notifier.prototype.sendMessage = function(msg) {
    var i, len, msg_stanza;

    if (this.client && this.isOnline)
    {
        len = this.informlist.length;

        for (i = 0; i < len; i += 1)
        {
            msg_stanza = new xmpp.Element('message', {to: this.informlist[i], type: 'chat'})
                .c('body').t(msg);
            this.client.send(msg_stanza);
        }
    }
};

//
//
//  Main
//
//

console.log("****************************************************");
console.log("****************************************************");
console.log("*                                                  *");
console.log("STARTED LOGCATCHER @ " + Date());
console.log("*                                                  *");
console.log("****************************************************");
console.log("****************************************************");

// Setup defaults
var debugCommands = false;

var i, arg;

if (process.argv.length > 2)
{
    for (i = 0; i < process.argv.length; i += 1)
    {
        // Don't start processing args until we get beyond the .js itself.
        if (i >= 2)
        {
            arg = process.argv[i].toLowerCase();

            if (arg === '--help' || arg === '-help')
            {
                console.log("***********");
                console.log("*");
                console.log("* LogCatcher usage:");
                console.log("* --help - this usage help.");
                console.log("* --debugcommands - Allow direct chat to switchboard for backend commands.");
                console.log("*");
                console.log("* Settings received: ", settings);
                console.log("*");
                console.log("***********");
                process.exit(1);
            }
            else if (arg === '--debugcommands' || arg === '-debugcommands')
            {
                debugCommands = true;
                console.log(":: Enabling debug commands backend.");
            }
        }
    }
}

//var notify;
///*
var notify = new Notifier({jid: settings.notifier.username, password: settings.notifier.password,
                            server: settings.SERVERNAME, port: settings.SERVERPORT},
                            settings.notifier.notify_list);

//
// Login as Switchboard operator
//
var logcatcher = new LogCatcher(settings.logcatcher.username, settings.logcatcher.password, notify);
//*/

/*var ibb = new gcibb.IBBTransfer(function (tosend_back) {
    console.log('Callback: Send-back: ' + tosend_back);
});
*/

/* tests for 'open' -- pass followed by fails for 2-5

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'one'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, sid: 'one', stanza: 'iq'}).root());

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'two'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, sid: 'two', stanza: 'message'}).root());

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'three'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, stanza: 'iq'}).root());

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'four'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', sid: 'four', stanza: 'iq'}).root());

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'five'})
    .c('open', {'block-size': 512, sid: 'one', stanza: 'iq'}).root());
*/

/* Data transfer test. Open valid. Then start sending data (valid) */
/*
ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'onedata'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, sid: 'data1', stanza: 'iq'}).root());

//
// Bogus - try opening the same sid twice.
//
ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'badopen'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, sid: 'data1', stanza: 'iq'}).root());

var data_in = 'Hello there all you fine people.';
var data_out = new Buffer(data_in, 'binary').toString('base64');

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'twodata'})
    .c('data', {xmlns: 'http://jabber.org/protocol/ibb', sid: 'data1', seq: 0})
    .t(data_out).root());

data_in = 'And your little dog too!';
data_out = new Buffer(data_in, 'binary').toString('base64');

setTimeout(function() {
    console.log('Second one...');

    ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'threedata'})
        .c('data', {xmlns: 'http://jabber.org/protocol/ibb', sid: 'data1', seq: 1})
        .t(data_out).root());

    setTimeout(function() {
        console.log('And close it...');

        ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'fourdata'})
            .c('close', {xmlns: 'http://jabber.org/protocol/ibb', sid: 'data1'}).root());

        ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'danglingopen'})
            .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, sid: 'dataincomplete', room: 'myroom', nick: 'my%20nickname', stanza: 'iq'}).root());

        console.log('Summary:');
        console.log('history: ' + ibb.DumpHistory());
        console.log('active: ' + ibb.DumpActiveTransfers());
    }, 500);
}, 500);

//
// Bogus sid -- not opened yet.
//
ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'baddata'})
    .c('data', {xmlns: 'http://jabber.org/protocol/ibb', sid: 'dataBogus', seq: 0})
    .t(data_out).root());
*/
