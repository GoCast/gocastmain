/**
 * Log Catcher Bot - Listens for clients to request sending files up to the server and receives them.
 **/

 /*
 TODO

 */
/*jslint node: true, white: true */
var settings = require('./settings');   // Our GoCast settings JS
if (!settings) {
    settings = {};
}
if (!settings.notifier) {
    settings.notifier = {};
}

var sys = require('util');
var xmpp = require('node-xmpp');
var fs = require('fs');
var ltx = require('ltx');

'use strict';

var GoCastJS = require('./gcall_node');

GoCastJS.Notifier = function(serverinfo, jidlist) {
    var users, k, self = this, startMsg,
        bOnlineEver = false;

    this.server = serverinfo.server || "video.gocast.it";
    this.port = serverinfo.port || 5222;
    this.jid = serverinfo.jid;
    this.password = serverinfo.password;

    this.informlist = jidlist;
    this.isOnline = false;

    startMsg = GoCastJS.logDate() + " - Notifier started:";
    console.log(startMsg);

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
            self.isOnline = true;

            if (!bOnlineEver) {
                bOnlineEver = true;

                // Send these messages out only once.
                self.sendMessage(startMsg);
                self.sendMessage(users);
            }

          });

    this.client.on('offline',
          function() {
            self.isOnline = false;
          });

    this.client.on('error', function(e) {
        sys.puts(e);
    });

};

GoCastJS.Notifier.prototype.sendMessage = function(msg) {
    var i, len, msg_stanza;

    if (this.client && this.isOnline)
    {
        len = this.informlist.length;

        for (i = 0; i < len; i += 1)
        {
            msg_stanza = new xmpp.Element('message', {to: this.informlist[i], type: 'chat'})
                .c('body').t(GoCastJS.logDate() + ' - Notfier: ' + msg);
            if (this.client && this.client.socket) {
                this.client.send(msg_stanza);
            }
            else {
                console.log('***ERROR*** - Notifier sendMessage() - client socket is NULL. Message not sent was: ', msg_stanza);
            }
        }
    }
    else {
        console.log('Notifier: Error: Offline message lost: ' + msg);
    }
};

module.exports = GoCastJS;
