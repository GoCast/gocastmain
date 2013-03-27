/*jslint node: true, white: true */
/*global Buffer */
var settings;

try {
    settings = require('./settings');   // Our GoCast settings JS
} catch(e) {
    settings = require('../../settings');   // Look relative ... for developers on desktops.
}

if (!settings) {
    settings = {};
}
if (!settings.logcatcher) {
    settings.logcatcher = {};
}

var sys = require('util');
var xmpp = require('node-bosh-xmpp-client/lib/boshclient');
var fs = require('fs');
var ltx = require('ltx');
var gcutil;
try {
    gcutil = require('./gcutil_node');
} catch(e2) {
    gcutil = require('../../../gocastjs/nodejs/gcutil_node');
}

var argv = process.argv;

'use strict';

//xmpp.setLogLevel('DEBUG'); // Debug

// jid, password, boshurl
function XmppConn(user, password, url, cbWhenOnline) {
    var self = this;

    this.cbWhenOnline = cbWhenOnline;
    this.user = user;
    this.password = password;
    this.status = 'connecting';

    this.creationTime = new Date().getTime();

    this.client = new xmpp.Client(user, password, url);

    this.client.on('error', this.onErrorHandler.bind(this));
    this.client.on('offline', this.onOfflineHandler.bind(this));
    this.client.on('online', this.onOnlineHandler.bind(this));
    this.client.on('stanza', this.onStanzaHandler.bind(this));
}

XmppConn.prototype = {
    getStatus: function() {
        return this.status;
    },
    getTimeAlive: function() {
        return new Date().getTime() - this.creationTime;
    },
    getSessionInfo: function() {
        if (this.status !== 'connecting') {
            return { rid: this.client.sess_attr.rid,
                     jid: this.client.sess_attr.jid.username + '@' + this.client.sess_attr.jid.domain,
                     sid: this.client.sess_attr.sid };
        }
        else {
            return null;
        }
    },
    onErrorHandler: function(exception) {
        console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + ']: Error: ', exception);
    },
    onOfflineHandler: function(reason) {
        console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + ']: Offline.');
        this.status = 'offline';
    },
    onOnlineHandler: function() {
        console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + ']: Online.');
        this.status = 'online';

        if (this.cbWhenOnline) {
            console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + ']: Calling back for online status.');
            this.cbWhenOnline(this.user, this.getSessionInfo(), this);

            this.cbWhenOnline = null;   // Only call it once.
        }
    },
    onStanzaHandler: function(ltxe) {
        var pong;

        if (ltxe.is('iq') && ltxe.getChild('ping')) {
            pong = xmpp.$iq({to: ltxe.attrs.from, id: ltxe.attrs.id, type: 'result'});
            // Respond to a ping with a pong.
            console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + '] Received PING - Sending pong...');
            if (this.client) {
                this.client.send(pong);
            }
        }
    }
};

function BoshXmppManager(boshurl) {
    var self = this;

    this.boshurl = boshurl;

    this.maxAnonCache = 7;      // How many anonymous rid/jid/sid connections should we keep alive?
    this.maxIdleTime = 1000 * 60 * 60;  // Only keep a cache entry for a max of one hour.

    this.sessions = {}; // Going to be an associative map/array of sessions to rid/jid/sid combos
    this.anonymous = [];    // Simple array of 'maxAnonCache' entries of live rid/jid/sid combos

}

BoshXmppManager.prototype = {
    log: function(a, b, c, d, e) {
        console.log('BoshXmppManager-Log: ', a || '', b || '', c || '', d || '', e || '');
    },
    privateCreateSession: function(user, password, cbSuccess, cbFailure, timeout) {
        var sess, timer = null,
            tryTimeout = timeout || 5000,
            self = this;

        if (cbFailure) {
            timer = setTimeout(function() {
                // If we get here, it took too long to make the connection.
                delete this.sessions[user];
                cbFailure('timeout');
            }, tryTimeout);
        }

        // Age-out entries from the cache.
        setTimeout(function() {
            if (self.sessions[user] && self.sessions[user].getTimeAlive() >= (self.maxIdleTime - 5000)) {
                // This particular session has been sitting in the cache for a LONG time.
                self.sessions[user].disconnect();
                delete self.sessions[user];
            }
        }, this.maxIdleTime);

        this.sessions[user] = new XmppConn(user, password, this.boshurl, cbSuccess ? function(u, si, o) {
                                    if (timer) {
                                        console.log('success-callback - ' + u + ', cancelling timer.');
                                        clearTimeout(timer);
                                        timer = null;
                                    }

                                    cbSuccess(u, si, o);
                                    // Now replace the given one with a new instance starting up
                                    // without a callback since it hasn't been explicitly requested.
                                    self.sessions[user] = new XmppConn(user, password, self.boshurl, null);
                                } : null);
    },
    getLiveSession: function(user, password, cbSuccess, cbFailure, timeout) {
        if (this.sessions[user] && this.sessions[user].getStatus() !== 'connecting') {
            // We have an active, ready to roll connection. Hand it back and start a new one.
            this.log('getLiveSession: IMMEDIATE: Found user. Found active connection. Passing back.');
            cbSuccess(user, this.sessions[user].getSessionInfo(), this.sessions[user]);

            // Now replace the existing entry with a new one. WITH NO CALLBACK.
            this.privateCreateSession(user, password, null, null);
        }
        else if (this.sessions[user]) {
            // We have a connection, but it's not ready yet. Need to ensure it's got a callback
            // prepped so when it's ready, it heals itself.
            this.log('getLiveSession: DEFERRED-ALIVE: Found user. Connection in progress.');

            if (this.sessions[user].cbWhenOnline) {
                this.log('getLiveSession: WARN: Callback already set on connection...');
            }

            if (this.sessions[user].getTimeAlive() > this.maxConnectionTryTime) {
                this.log('getLiveSession: WARN: Connection progress too slow. Replacing connection.');
                this.privateCreateSession(user, password, cbSuccess, cbFailure, timeout);
            }
            else {
                // Just be certain the object has a callback ready...
                this.sessions[user].cbWhenOnline = cbSuccess;
            }
        }
    }
};

var sess = {};
sess['anon_conference@dev.gocast.it'] = new XmppConn('anon_conference@dev.gocast.it', 'gocast.anon.user', 'http://dev.gocast.it:80/xmpp-httpbind/',
        function(user, sessinfo, obj) { console.log('Test: Now online in callback: ' + user + ', with session info: ', sessinfo); });

setTimeout(function() {
    sess['anon_conference@dev.gocast.it'].client.setNoMoreResponse();
    sess['anon_conference@dev.gocast.it'] = new XmppConn('anon_conference@dev.gocast.it', 'gocast.anon.user', 'http://dev.gocast.it:80/xmpp-httpbind/',
            function(user, sessinfo, obj) { console.log('Test-SECONDARY: Now online in callback: ' + user + ', with session info: ', sessinfo); });
}, 40*1000);
