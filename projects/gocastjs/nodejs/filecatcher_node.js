/**
 * File Catcher Bot - Listens for clients to request sending files up to the server and receives them.
   Also makes soft links for website availability in the UI.
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
if (!settings.filecatcher) {
    settings.filecatcher = {};
}

var sys = require('util');
var xmpp = require('node-xmpp');
var fs = require('fs');
var ltx = require('ltx');

var argv = process.argv;
var EventEmitter = require('events').EventEmitter;

var GoCastJS = require('./gcall_node');

'use strict';

///
///
///
///  F I L E C A T C H E R
///
///
///

GoCastJS.FileCatcher = function(user, pw, notifier) {
    var self = this;

    this.SERVER = settings.SERVERNAME;

    this.user = user || settings.filecatcher.username;
    this.password = pw || settings.filecatcher.password;

    this.client = new xmpp.Client({ jid: this.user, password: this.password, reconnect: true, host: this.SERVER, port: settings.SERVERPORT });

    if (notifier) {
        this.notifier = notifier;
    }
    else {
        this.notifier = new GoCastJS.Notifier({jid: settings.notifier.username, password: settings.notifier.password,
                            server: settings.SERVERNAME, port: settings.SERVERPORT},
                            settings.notifier.notify_list);
    }

    this.iqnum = 0;
    this.iq_callbacks = {};

    var time = 0;

    this.IBB = new GoCastJS.IBBTransfer(this.client, this.notifier);
    this.IBB.chdir(settings.filecatcher.dest);
    this.IBB.on('received', function(recd) {
        self.emit('received', recd);
    });

    this.client.on('online', function() {
        // Mark ourself as online so that we can receive messages from direct clients.
        self.client.send(new xmpp.Element('presence'));

        self.log("Listening for filecatcher queries.");
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

};

sys.inherits(GoCastJS.FileCatcher, EventEmitter);

GoCastJS.FileCatcher.prototype.notifylog = function(msg) {
    if (this.notifier) {
        this.notifier.sendMessage(GoCastJS.logDate() + " - FileCatcher: " + msg);
    }
};

GoCastJS.FileCatcher.prototype.log = function(msg) {
    console.log(GoCastJS.logDate() + " - FileCatcher: " + msg);
};

GoCastJS.FileCatcher.prototype.sendIQ = function(iq, cb) {
    var iqid = "filecatcher_iqid" + this.iqnum,
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

GoCastJS.FileCatcher.prototype.sendPrivateMessage = function(tojid, msg) {
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
GoCastJS.FileCatcher.prototype.handleMessage = function(msg) {
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
GoCastJS.FileCatcher.prototype.handlePresence = function(pres) {
    this.log(pres);
};

GoCastJS.FileCatcher.prototype.handleIq = function(iq) {
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
        else {
            this.log('Inbound IBB transfer - IGNORED. No IBB present.');
        }

    }
    else if (!iq.attrs.from.split('@')) {
        this.log("UNHANDLED IQ: " + iq);
    }
};

module.exports = GoCastJS;
