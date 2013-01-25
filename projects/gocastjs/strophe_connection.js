/* Requires:
   Strophe
   JQuery

   */

//
// @brief GoCastJS.StropheConnection is a stand-alone connection to XMPP servers. It wraps
//        Strophe with the following features:
//        1. Has its own over-ride .log function
//        2. Automatically responds to 'ping' requests from the server.
//        3. Wraps critical Strophe functions in try/catch blocks to avoid
//           prior issues with Strophe.
//        4. Hooks into Strophe's log function to output STROPHE-LOG: entries to better
//           keep track of what's going on down in the Strophe library.
//        5. debugXML() function will allow enabling full blown xml logs.
//        6. Automatically saves and re-loads rid/jid/sid information and attempts to keep
//           errant connections alive as best possible.
//        7. Handles on-before-unload for the window and saves the rid/jid/sid if still valid.
//
// opts object MUST contain:
//   boshurl: absolute or relative path to the bosh server '/xmpp-httpbind' is normal.
//   xmppserver: the server name for the xmpp server 'video.gocast.it' is normal.
//   statusCallback: function(status) to be called as connection changes over time.
// opts MAY contain:
//   logFn: substitute function for logging errors, etc.
//

/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global Buffer */
'use strict';

var GoCastJS = GoCastJS || {};

GoCastJS.StropheConnection = function(opts) {
    var self = this;

    this.log('New GoCastJS.StropheConnection.');

    if (!opts.boshurl || !opts.statusCallback || !opts.xmppserver) {
        throw 'StropheConnection: ERROR: Bad invocation - must provide all required parameters.';
    }

    this.id = null;
    this.pw = null;
    this.bAnonymous = true;

    this.numConnects = 0;
    this.causeAuthfail = false;
    this.causeConnfail = false;

    this.boshurl = opts.boshurl;
    this.statusCallback = opts.statusCallback;
    this.xmppserver = opts.xmppserver;

    this.disconnectTimer = null;

    if (opts.logFn) {
        this.log = opts.logFn;
    }

    // Initialize local remembered rid/jid/sid
    this.forgetReconnectInfo();

    if (typeof (Storage) !== 'undefined') {
        this.rememberedJid = localStorage.jid;
        this.rememberedRid = localStorage.rid;
        this.rememberedSid = localStorage.sid;
        // Convert to boolean in-bound from localStorage
        this.rememberedAnonymous = localStorage.bAnonymous === 'true';

        // Now remove from local storage any memory of this until we 'unload'
        this.forgetReconnectInfoInLocalStorage();
    }

    // We don't have a Strophe Connection at all yet.
    this.connection = new Strophe.Connection(this.boshurl);

    // Custom status item.
    Strophe.Status.TERMINATED = 99;

    Strophe.log = function(level, msg) {
        if (level > 0) {
            console.log('STROPHE-LOG: level:' + level + ', msg: ' + msg);
        }
    };

    $(window).on('beforeunload', function() {
        self.log('StropheConnection: Before Unload.');
        if (self.connection && self.connection.connected && self.connection.authenticated) {
            self.log('Storing rid/jid/sid for later.');
            self.saveLoginInfoToLocalStorage();
        }
    });
};

GoCastJS.StropheConnection.prototype = {
    usernameTransform: function(email) {
        return email.toLowerCase().replace('@', '~');
    },

    getEmailFromJid: function() {
        if (this.id) {
            return Strophe.getNodeFromJid(this.id).toLowerCase().replace('~', '@');
        }
        else {
            return null;
        }
    },

    isAnonymous: function() {
        return this.bAnonymous;
    },

    forgetReconnectInfo: function() {
        this.rememberedJid = null;
        this.rememberedRid = null;
        this.rememberedSid = null;
        this.rememberedAnonymous = null;
    },

    saveLoginInfo: function() {
        if (this.connection && this.connection.authenticated && this.connection.connected) {
            this.rememberedJid = this.connection.jid;
            this.rememberedRid = this.connection.rid;
            this.rememberedSid = this.connection.sid;
            this.rememberedAnonymous = this.bAnonymous;
        }
    },

    forgetReconnectInfoInLocalStorage: function() {
        if (typeof (Storage) !== 'undefined') {
            delete localStorage.jid;
            delete localStorage.rid;
            delete localStorage.sid;
            delete localStorage.bAnonymous;
        }
    },

    log: function() {
        console.log.apply(console, arguments);
    },

    //
    // @brief Save off the rid, jid, sid, and anonymous status so we can utilize it later
    //        if we have network connection issues and need to re-login without asking for
    //        username/password information again.
    //
    saveLoginInfoToLocalStorage: function() {
        if (typeof (Storage) !== 'undefined') {
            if (this.connection && this.connection.authenticated && this.connection.connected) {
                this.log('Saving Login Info: RID: ' + this.connection.rid + ', jid: ' + this.connection.jid + ', sid: ' + this.connection.sid);
                localStorage.jid = this.connection.jid;
                localStorage.rid = this.connection.rid;
                localStorage.sid = this.connection.sid;
                localStorage.bAnonymous = this.bAnonymous;
            }
            else {
                this.log('WARN: saveLoginInfo: did not save as connection is not healthy.');
            }
        }
    },

    hasSavedLoginInfo: function() {
        if (this.rememberedJid && this.rememberedJid.split('@')[1] && this.rememberedRid && this.rememberedSid) {
            return true;
        }

        return false;
    },

    hasSavedRegisteredLoginInfo: function() {
        if (this.hasSavedLoginInfo() && this.rememberedAnonymous === false) {
            return true;
        }

        return false;
    },

    //
    // @brief If we have stored login information, then use it to reattach.
    // @return Failure - null - no stored rid/jid/sid login information.
    //         Success - The jid used to re-attach if it's a valid registered user.
    //         Success - 'anonymous' if its an anonymous login.
    //
    autoConnect: function() {
        this.log('StropheConnection: Auto-Connecting.');

        if (this.hasSavedLoginInfo()) {
            this.log('autoConnect: Saved user info found.');
            this.bAnonymous = this.rememberedAnonymous;

            if (this.bAnonymous) {
                this.id = this.xmppserver;
            }
            else {
                this.id = this.rememberedJid;
            }

    // RMW: In theory we are supposed to advance RID by one, but Chrome fails it while Firefox is ok. Sigh. No advancing...
    //               Callcast.reattach(Callcast.connection.jid, Callcast.connection.sid, new Number(Callcast.connection.rid) + 1, Callcast.conn_callback);
            this.privateReattach(this.rememberedJid, this.rememberedSid, this.rememberedRid);

            return this.rememberedJid;
        }
        else if (this.id && this.pw) {
            this.log('autoConnect: Non-anonymous.');
            this.bAnonymous = false;

            // In this case, we actually have a username and a password for login. Use it.
            this.connect({ jid: this.id, password: this.pw });

            return this.id;
        }
//        else if (!/@/.test(this.id) && !this.pw) {
        else if (this.bAnonymous) {
            // We've discovered this was an anonymous login in the beginning - so do it again.
            this.log('autoConnect: Got anonymous detected.');
            this.connect(); // Anonymous connection.

            return 'anonymous';
        }

        this.causeTerminating = true;
        this.log('autoConnect: Dropping out. id: ' + this.id + ', pw: ' + this.pw);
        return null;
    },

    connect: function(opts) {
        if (opts) {
            if (typeof(opts) !== 'object') {
                throw 'connect: ERROR: opts must be an object if given.';
            }

            this.pw = opts.password;

            // We were handed a full-blown jid.
            if (opts.jid) {
                this.bAnonymous = false;
                this.id = opts.jid;
            }
            else if (opts.username) {
                this.bAnonymous = false;

                // Handed an email address. Translate it.
                if (opts.username.match(/@/)) {
                    this.id = this.usernameTransform(opts.username) + '@' + this.xmppserver;
                }
                else {
                    this.id = opts.username + '@' + this.xmppserver;
                }
            }
            else {
                this.log('StropheConnection: connect: ERROR: No username or jid given.');
                throw 'StropheConnection: connect: ERROR: No username or jid given.';
            }
        }
        else {
            // Anonymous for null or undefined opts
            this.id = this.xmppserver;
            this.pw = '';
            this.bAnonymous = true;
        }

        this.log('StropheConnection: connect: computed id=' + this.id);

        if (this.connection) {
            // Thinking we should really NOT null-out the connection but instead reset it.
            this.reset('connect-reset');
        }
        else {
            this.log('WARN: connection was null and should not be.');
            // We don't have a Strophe Connection at all yet.
            this.connection = new Strophe.Connection(this.boshurl);
        }

        // Anonymous XMPP connections are characterized by no password and a username which is
        // only hostname.domainname
        // TODO:RMW potential BUG - not sure we should do this at all.
        if (!this.bAnonymous && !this.pw) {
            this.log('StropheConnection: connect: WARN: Must be on a failed re-attach. No password for user ' + this.id);
            this.forgetReconnectInfo();
            this.reset('connect-failed-reattach-reset');
            this.statusCallback(Strophe.Status.TERMINATED);
            return;
        }

        this.numConnects += 1;
        this.log('Connecting(#' + this.numConnects + ') ...');

        try {
            this.connection.connect(this.id, this.pw, this.conn_callback.bind(this));
        }
        catch(e) {
            console.log('CATCH: ERROR on connect() attempt: ' + e);
        }
    },

    //
    // @brief Depending on how we arrived at the disconnected state will determine
    //        some of how we handle it. For instance, transiting through CONNFAIL
    //        will imply that we would probably want to try reattaching.
    //
    handleDisconnect: function() {

        // This is called when we are DISCONNECTED

        this.log('StropheConnection: handleDisconnect: processing.');

        if (this.causeConnfail) {
            this.log('INFO: CONNFAIL led us to DISCONNECTED.');
            this.autoConnect(); // Attempt to re-connect.
        }

        if (this.causeTerminating || this.causeAuthfail) {
            this.forgetReconnectInfo();
            this.reset('Full disconnection - heading for TERMINATED.');
            this.statusCallback(Strophe.Status.TERMINATED);
        }

        this.causeAuthfail = false;
        this.causeConnfail = false;
        this.causeTerminating = false;
    },

    conn_callback: function(status, err) {
        var self = this;

        if (err === 'item-not-found') {
            this.log('conn_callback: BOSH responded with item-not-found. Connection is invalid now.');
            this.forgetReconnectInfo();
        }

        if (err) {
            this.log('conn_callback(' + this.numConnects + '): Status: ' + status + ' Err:', err);
        }
        else {
            this.log('conn_callback(' + this.numConnects + '): Status: ' + status + ' No Err.');
        }

//TODO:RMW - It seems that in Callcast, in many of these states, I 'remembered' the rid/jid/sid
//           It's not clear if that was a good or bad idea.
        switch(status) {
            case Strophe.Status.CONNECTED:
                this.log('GoCastJS.StropheConnection: CONNECTED');
                this.saveLoginInfo();
                this.connection.addHandler(this.privateSetupPingHandler.bind(this), 'urn:xmpp:ping', 'iq', 'get');
                break;
            case Strophe.Status.DISCONNECTED:
                this.log('GoCastJS.StropheConnection: DISCONNECTED');

                // If we arrive here, we should kill the disconnection timer.
                if (this.disconnectTimer) {
                    clearTimeout(this.disconnectTimer);
                    this.disconnectTimer = null;
                }

                // Calling the status early to keep things in order.
                this.statusCallback(status);
                this.handleDisconnect();

                // Artificial early return.
                return;
            case Strophe.Status.AUTHENTICATING:
                this.log('GoCastJS.StropheConnection: AUTHENTICATING');
                break;
            case Strophe.Status.CONNECTING:
                this.log('GoCastJS.StropheConnection: CONNECTING');
                break;
            case Strophe.Status.ATTACHED:
                this.log('GoCastJS.StropheConnection: ATTACHED');
                this.saveLoginInfo();
                this.privatePingServer();
                this.connection.addHandler(this.privateSetupPingHandler.bind(this), 'urn:xmpp:ping', 'iq', 'get');
                break;
            case Strophe.Status.DISCONNECTING:
                this.log('GoCastJS.StropheConnection: DISCONNECTING');

                if (this.disconnectTimer) {
                    this.log('GoCastJS.StropheConnection: WARN: While DISCONNECTING, disconnectTimer already set. Clearing.');
                    clearTimeout(this.disconnectTimer);
                }

                this.disconnectTimer = setTimeout(function() {
                    // If we get here, then DISCONNECTING was not followed in a timely manner
                    // by DISCONNECTED. So, we need to make a judgement call and call this 'bad'.
                    // As such, we will trigger a TERMINATED upwards and forget login info.
                    self.disconnectTimer = null;
                    self.forgetReconnectInfo();

                    // One more shot at getting back on the horse wihtout incident...
                    // If we have an .id and .pw both, then connect()
                    if (self.id && self.pw) {
                        self.log('Disconnect_Timer: Re-connecting with prior given user/password');
                        self.connect({ jid: self.id, password: self.pw });
                    }
                    else {
                        self.reset('DISCONNECTING_TIMEOUT - Never reached DISCONNECTED.');
                        self.statusCallback(Strophe.Status.TERMINATED);
                    }
                }, 1000);

                break;
            case Strophe.Status.CONNFAIL:
                this.log('GoCastJS.StropheConnection: CONNFAIL');
                this.causeConnfail = true;
                break;
            case Strophe.Status.AUTHFAIL:
                this.causeAuthfail = true;
                this.log('GoCastJS.StropheConnection: AUTHFAIL');
                break;
            default:
                this.log('GoCastJS.StropheConnection: ERROR: UNKNOWN STATUS: ' + status);
                break;
        }

        this.statusCallback(status);
    },

    privatePingServer: function() {
        var ping = $iq({to: this.xmppserver, type: 'get'}).c('ping', {xmlns: 'urn:xmpp:ping'});
        this.log('StropheConnection: Pinging Server as a health-check.');
        this.send(ping);
    },

    privateSetupPingHandler: function(iq) {
        var pong = $iq({to: $(iq).attr('from'), id: $(iq).attr('id'), type: 'result'});
        this.log('StropheConnection: Received PING - Sending pong...');
        if (this.connection) {
            this.connection.send(pong);

            // Periodically we get pinged (usually at a frequency of 30 seconds)
            // When we are pinged, the rid changes...so store it in case we have a failure
            // that doesn't manage to trigger the on-unload which also saves login info.
            this.saveLoginInfo();
        }

        return true;
    },

    //
    // @brief Utilizes the rid/jid/sid to re-login to an existing session.
    //
    privateReattach: function(jid, sid, inRid) {
        var rid;

        if (!jid || !sid || !inRid || !jid.split('@')[1])
        {
            this.log('Re-attach ERROR: RID/SID/JID is null. RID=' + inRid + ', SID=' + sid + ', JID=' + jid);
            return;
        }

        // Auto-advance the rid.
        // NOTE: Seems auto-advance causes problems. Skipping for now.
        rid = parseInt(inRid, 10);
        // rid = parseInt(inRid, 10) + 1;

        if (this.connection)
        {
            this.reset('reattach-reset');
        }
        else {
            this.log('WARN: connection was null and should not be.');
            // We don't have a Strophe Connection at all yet.
            this.connection = new Strophe.Connection(this.boshurl);
        }

        this.numConnects += 1;
        this.log('StropheConnection: Re-attaching(' + this.numConnects + ') -- jid=' + jid + ', sid=' + sid + ', rid=' + rid);

        // Once we are primed for re-attaching, we should forget this info. If it does wind
        // up being good, we'll get a new rid/jid/sid upon ATTACHED or CONNECTED to save.
        // And if we don't get that far due to other failures, then we shouldn't re-try this rid/jid/sid
        // anyway.
        this.forgetReconnectInfo();

        try {
            this.connection.attach(jid, sid, rid, this.conn_callback.bind(this));
        }
        catch(e) {
            console.log('CATCH: ERROR on attach() attempt: ' + e);
        }
    },

    debugXML: function(bEnable) {
        var self = this;

        if (bEnable === true || bEnable === null || bEnable === undefined) {
            this.connection.rawInput = function(data) {
                if ($(data).children()[0]) {
                    self.log("RAW-IN:", $(data).children()[0]);
                }
                else {
                    self.log("RAW-IN:", $(data));
                }
            };

            this.connection.rawOutput = function(data) {
                if ($(data).children()[0]) {
                    self.log("RAW-OUT:", $(data).children()[0]);
                }
                else {
                    self.log("RAW-OUT:", $(data));
                }
            };
        }
        else {
            this.connection.rawInput = function() {};
            this.connection.rawOutput = function() {};
        }
    },

    setSync: function(bEnable) {
        this.log('StropheConnection: setSync(' + bEnable + ')');

        if (this.connection) {
            if (bEnable === false) {
                this.connection.sync = false;
            }
            else {
                this.connection.sync = true;
            }
        }
    },

    send: function(msg) {
        if (this.connection) {
            try {
                this.connection.send(msg);
            }
            catch(e) {
                console.log('CATCH: ERROR on send() attempt: ' + e);
            }
        }
        else {
            this.log('StropheConnection: ERROR: Cannot send() - no connection.');
        }
    },

    addHandler: function(handler, ns, name, type, id, from, options) {
        if (this.connection) {
            try {
                return this.connection.addHandler(handler, ns, name, type, id, from, options);
            }
            catch(e) {
                console.log('CATCH: ERROR on addHandler() attempt: ' + e);
                return null;
            }
        }
        else {
            this.log('StropheConnection: ERROR: Cannot addHandler() - no connection.');
            return null;
        }
    },

    disconnect: function(reason) {
        if (this.connection) {
            try {
                this.connection.disconnect(reason);
                this.causeTerminating = true;
            }
            catch(e) {
                console.log('CATCH: ERROR on disconnect() attempt: ' + e);
            }
        }
        else {
            this.log('StropheConnection: ERROR: Cannot disconnect() - no connection.');
        }
    },

    flush: function() {
        if (this.connection) {
            try {
                this.connection.flush();
            }
            catch(e) {
                console.log('CATCH: ERROR on flush() attempt: ' + e);
            }
        }
        else {
            this.log('StropheConnection: ERROR: Cannot flush() - no connection.');
        }
    },

    getUniqueId: function(suffix) {
        if (this.connection) {
            return this.connection.getUniqueId(suffix);
        }
        else {
            this.log('StropheConnection: ERROR: Cannot getUniqueId() - no connection.');
            return null;
        }
    },

    getJid: function() {
        if (this.connection) {
            return this.connection.jid;
        }
        else {
            this.log('StropheConnection: ERROR: Cannot getJid() - no connection.');
            return null;
        }
    },

    sendIQ: function(elem, callback, errback, timeout) {
        if (this.connection) {
            try {
                return this.connection.sendIQ(elem, callback, errback, timeout);
            }
            catch(e) {
                console.log('CATCH: ERROR on sendIQ() attempt: ' + e);
                return null;
            }
        }
        else {
            this.log('StropheConnection: ERROR: Cannot sendIQ() - no connection.');
            return null;
        }
    },

    reset: function(reason) {
        this.log('**** reset: Reason: ' + reason + ' ****');

        if (this.connection) {
            try {
                return this.connection.reset();
            }
            catch(e) {
                console.log('CATCH: ERROR on reset() attempt: ' + e);
                return null;
            }
        }
        else {
            this.log('StropheConnection: ERROR: Cannot reset() - no connection.');
            return null;
        }
    }
};
