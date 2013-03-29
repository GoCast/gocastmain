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
                     jid: this.client.sess_attr.jid.toString(),
                     sid: this.client.sess_attr.sid };
        }
        else {
            return null;
        }
    },
    setComplete: function() {
        this.status = 'complete';
        this.client.setNoMoreResponse();
    },
    disconnect: function() {
        this.status = 'complete';
        this.client.disconnect();
    },
    setNoMoreResponse: function() {
        this.status = 'complete';
        this.client.setNoMoreResponse();
    },
    onErrorHandler: function(exception) {
        console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + ']: Error: ', exception);
    },
    onOfflineHandler: function(reason) {
//        console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + ']: Offline.');
        this.status = 'offline';
    },
    onOnlineHandler: function() {
//        console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + ']: Online.');
        this.status = 'online';

        if (this.cbWhenOnline) {
//            console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + ']: Calling back for online status.');
            this.cbWhenOnline(this.user, this.getSessionInfo(), this);

            this.cbWhenOnline = null;   // Only call it once.
            this.setComplete();
        }
    },
    onStanzaHandler: function(ltxe) {
        var pong;

        if (ltxe.is('iq') && ltxe.getChild('ping')) {
            pong = xmpp.$iq({to: ltxe.attrs.from, id: ltxe.attrs.id, type: 'result'});
            // Respond to a ping with a pong.
//            console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + '] Received PING - Sending pong...');
            if (this.client) {
                this.client.send(pong);
            }
        }
//        else {
//            console.log('XmppConn: [' + this.client.sess_attr.jid.toString() + '] Received: ' + ltxe.toString());
//        }
    }
};

function BoshXmppManager(boshurl) {
    var self = this;

    this.boshurl = boshurl || settings.BOSHLOCAL;
    this.anon_username = settings.ANON_USERNAME;
    this.anon_password = settings.ANON_PASSWORD;

    this.maxAnonCache = 7;      // How many anonymous rid/jid/sid connections should we keep alive?
    this.maxIdleTime = 1000 * 60 * 60;  // Only keep a cache entry for a max of one hour.
    this.cacheLoginTimeout = 5000;  // For all cache entries - only wait this long until we invalidate them if not healthy.

    this.sessions = {}; // Going to be an associative map/array of sessions to rid/jid/sid combos
    this.anonymous = [];    // Simple array of 'maxAnonCache' entries of live rid/jid/sid combos

    setInterval(function() {
        self.printManagerReport();
    }, 60000);
}

BoshXmppManager.prototype = {
    log: function(a, b, c, d, e) {
        console.log('BoshXmppManager-Log: ', a || '', b || '', c || '', d || '', e || '');
    },
    printManagerReport: function() {
        var k, line, i, len, activeCount;

        console.log('BoshXmppManager: printManagerReport --');
        //
        // Report format:
        // user@domain - cache:[none | state] - entries:[active#]Act/[array-length]Len
        for (k in this.sessions) {
            if (this.sessions.hasOwnProperty(k)) {
                // Got an entry.
                line = k + ' - cache:';
                line += this.sessions[k].cache ? this.sessions[k].cache.getStatus() : 'none';
                line += ' - entries:';

                len = this.sessions[k].requested.length;
                activeCount = 0;
                for (i = 0; i < len ; i += 1) {
                    if (this.sessions[k].requested[i] && this.sessions[k].requested[i].getStatus() !== 'completed') {
                        activeCount += 1;
                    }
                }

                line += activeCount + 'Act/' + len + 'Len';
                console.log('  ' + line);
            }
        }

        console.log(' ');
    },
    killAllSessions: function(user) {
        var i, len;

        if (this.sessions[user]) {
            console.log('killAllSessions: Killing all sessions for: ' + user);
            if (this.sessions[user].cache) {
                this.sessions[user].cache.disconnect();
            }
            len = this.sessions[user].requested.length;
            for (i = 0; i < len; i += 1) {
                if (this.sessions[user].requested[i]) {
                    this.sessions[user].requested[i].disconnect();
                }
            }
        }
        else {
            console.log('killAllSessions: ERROR-AVOIDED: user does not exist: ' + user);
        }
    },
    setMaxIdleTimer: function(user) {
        var self = this;

        if (this.sessions[user]) {
            if (this.sessions[user].maxIdleTimer) {
                clearTimeout(this.sessions[user].maxIdleTimer);
            }

            this.sessions[user].maxIdleTimer = setTimeout(function() {
                self.killAllSessions(user);
                delete self.sessions[user];
            }, this.maxIdleTime);
        }
    },
    createUserEntry: function(user) {
        var self = this;

        if (!this.sessions[user]) {
            this.sessions[user] = {};
            this.sessions[user].requested = [];
            this.sessions[user].cache = null;
            this.setMaxIdleTimer(user);
        }
    },
    findOpenSlot: function(user) {
        var i, len;

        // Shouldn't really occur, but defensive.
        if (!this.sessions[user] || !this.sessions[user].requested) {
            this.createUserEntry(user);
            return 0;
        }

        len = this.sessions[user].requested.length;
        for (i = 0; i < len; i += 1) {
            // This entry is already nullified. It's open.
            if (!this.sessions[user].requested[i]) {
                return i;
            }
            // If it's completed, it should have been deleted already, but we'll call it available.
            if (this.sessions[user].requested[i].getStatus() === 'completed') {
                return i;
            }
        }

        return len;
    },
    privateCreateSession: function(user, password, cbSuccess, cbFailure, timeout) {
        var sess, cacheTimer = null, timer = null,
            tryTimeout = timeout || 5000,
            self = this, slot;

        this.setMaxIdleTimer(user); // Reset the timer anytime someone creates a session.

        // If a success callback is present, then this was requested for someone - right now.
        // If there is no cbSuccess callback, then it's for the cache.
        if (cbSuccess) {
            slot = this.findOpenSlot(user);

            if (cbFailure) {
                timer = setTimeout(function() {
                    // If we get here, it took too long to make the connection.
                    self.sessions[user].requested[slot].disconnect();
                    self.sessions[user].requested[slot] = null;
                    cbFailure('timeout');
                }, tryTimeout);
            }

            this.sessions[user].requested[slot] = new XmppConn(user, password, this.boshurl, function(u, si, o) {
                                    if (timer) {
//                                        console.log('success-callback - ' + u + '[' + slot + '], cancelling timer.');
                                        clearTimeout(timer);
                                    }

                                    o.setNoMoreResponse();
                                    cbSuccess(u, si, o);
                                    self.sessions[user].requested[slot] = null;

                                    // Now replace the given one with a new instance starting up
                                    // without a callback since it hasn't been explicitly requested.
                                    if (!self.sessions[user].cache || self.sessions[user].cache.getStatus() === 'offline' || self.sessions[user].cache.getStatus() === 'completed') {
                                        self.sessions[user].cache = new XmppConn(user, password, self.boshurl, null);
                                    }
                                });
        }

        // If there's no cache entry, make one.
        if (!self.sessions[user].cache || self.sessions[user].cache.getStatus() === 'offline' || self.sessions[user].cache.getStatus() === 'completed') {
            cacheTimer = setTimeout(function() {
                if (self.sessions[user].cache && self.sessions[user].cache.getStatus() !== 'online' &&
                    self.sessions[user].cache.getTimeAlive() >= self.cacheLoginTimeout) {
//                    console.log('cacheTimer: Unsure: alive=' + self.sessions[user].cache.getTimeAlive());
                    // If we get here, it took too long to make the connection.
                    self.sessions[user].cache.disconnect();
                    self.sessions[user].cache = null;
                    console.log('cache-login-timeout for user: ' + user);
                }
            }, self.cacheLoginTimeout + 250);

            this.sessions[user].cache = new XmppConn(user, password, this.boshurl, null);
        }

    },
    getLiveSession: function(user, password, cbSuccess, cbFailure, timeout) {
        if (!user) {
            user = this.anon_username;
            password = this.anon_password;
        } else {
            user = user.replace(/@/g, '~') + '@' + settings.SERVERNAME;
        }

        if (this.sessions[user] && this.sessions[user].cache && this.sessions[user].cache.getStatus() === 'online') {
            // We have an active, ready to roll connection. Hand it back and start a new one.
            this.log('getLiveSession: CACHE-HIT: Ready with user: ' + user);
            cbSuccess(user, this.sessions[user].cache.getSessionInfo(), this.sessions[user].cache);

            // Now replace the existing entry with a new one. WITH NO CALLBACK.
            this.sessions[user].cache.setNoMoreResponse();
            this.sessions[user].cache = null;
            this.privateCreateSession(user, password, null, null);
        }
        else {
            if (!this.sessions[user]) {
                this.log('getLiveSession: User not present. Creating entry for user: ' + user);
                // There is no entry at all for sessions[user]
                this.createUserEntry(user);
            }
            else {
                this.log('getLiveSession: CACHE-MISS: Connection in progress for: ' + user);
            }

            this.privateCreateSession(user, password, cbSuccess, cbFailure, timeout);
        }
    }
};

function test1() {
//    var au = 'anon_conference@dev.gocast.it', ap = 'gocast.anon.user',
    var au = '', ap = '',   // Use settings rather than hardwiring.
        ru = 'test1@dev.gocast.it', rp = 'test1',
        mgr = new BoshXmppManager(),
//        mgr = new BoshXmppManager('http://dev.gocast.it/xmpp-httpbind/'),
//        mgr = new BoshXmppManager('http://localhost:5288/nodejs-http-bind/'),
        handler = function(u, si, o) {
        console.log('handler: Online-ready: ' + si.jid + ': ' + si.rid);
        },
        failureHandler = function(msg) {
        console.log('failureHandler: ERROR: ' + msg);
        };

    mgr.getLiveSession(au, ap, handler, failureHandler);
    mgr.getLiveSession(au, ap, handler, failureHandler);
    mgr.getLiveSession(ru, rp, handler, failureHandler);
    mgr.getLiveSession(au, ap, handler, failureHandler);
    mgr.getLiveSession(ru, rp, handler, failureHandler);
    mgr.getLiveSession('junk@gocast.it', 'ugh', handler, failureHandler);

    setTimeout(function() {
        console.log('*****');
        console.log('Starting 2-second logins...');
        console.log('*****');
        mgr.getLiveSession(au, ap, handler, failureHandler);
        mgr.getLiveSession(ru, rp, handler, failureHandler);
    }, 2000);

    setTimeout(function() {
        console.log('*****');
        console.log('Starting 6-second logins...');
        console.log('*****');
        mgr.getLiveSession(au, ap, handler, failureHandler);
        mgr.getLiveSession(ru, rp, handler, failureHandler);
    }, 6000);
}

//test1();
exports.BoshXmppManager = BoshXmppManager;