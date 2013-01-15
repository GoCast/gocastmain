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
//

/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global Buffer */
'use strict';

var GoCastJS = GoCastJS || {};

GoCastJS.StropheConnection = function(boshconn, statusCallback, logFn) {
    var self = this;

    this.log('New GoCastJS.StropheConnection.');

    if (!boshconn || !statusCallback) {
        throw 'StropheConnection: ERROR: Bad invocation - must provide all required parameters.';
    }

    this.id = null;
    this.pw = null;
    this.bAnonymous = true;

    this.numConnects = 0;
    this.causeAuthfail = false;
    this.causeConnfail = false;

    this.boshconn = boshconn;
    this.statusCallback = statusCallback;

    if (logFn) {
        this.log = logFn;
    }

    // We don't have a Strophe Connection at all yet.
    this.connection = new Strophe.Connection(this.boshconn);

    Strophe.log = function(level, msg) {
        if (level > 0) {
            console.log('STROPHE-LOG: level:' + level + ', msg: ' + msg);
        }
    };

    $(window).on('beforeunload', function() {
        self.log('StropheConnection: Before Unload.');
        if (self.connection && self.connection.connected && self.connection.authenticated) {
            self.log('Storing rid/jid/sid for later.');
            self.saveLoginInfo();
        }
    });

};

GoCastJS.StropheConnection.prototype = {
    isAnonymous: function() {
        return this.bAnonymous;
    },

    forgetReconnectInfo: function() {
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
    saveLoginInfo: function() {
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
        var rid, jid, sid;

        if (typeof (Storage) !== 'undefined') {
            rid = localStorage.rid;
            jid = localStorage.jid;
            sid = localStorage.sid;

            // Now validate the data before returning.
            if (jid && jid.split('@')[1] && sid && rid) {
                return true;
            }
        }

        return false;
    },

    //
    // @brief If we have stored login information, then use it to reattach.
    // @return Failure - null - no stored rid/jid/sid login information.
    //         Success - The jid used to re-attach.
    //
    autoConnect: function() {
        this.log('StropheConnection: Auto-Connecting.');

        if (this.hasSavedLoginInfo()) {
            this.bAnonymous = localStorage.bAnonymous;

    // RMW: In theory we are supposed to advance RID by one, but Chrome fails it while Firefox is ok. Sigh. No advancing...
    //               Callcast.reattach(Callcast.connection.jid, Callcast.connection.sid, new Number(Callcast.connection.rid) + 1, Callcast.conn_callback);
            this.privateReattach(localStorage.jid, localStorage.sid, localStorage.rid);

            return localStorage.jid;
        }
        else if (this.id !== null && this.id !== '' && this.pw !== null && this.pw !== '') {
            // In this case, we actually have a username and a password for login. Use it.
            this.connect(this.id, this.pw);

            return this.id;
        }

        return null;
    },

    connect: function(id, pw) {
        this.id = id;
        this.pw = pw;

        if (id === null && pw === null) {
            this.log('StropheConnection: connect: null arguments. Throwing exception.');
            throw 'StropheConnection: connect: null arguments. Throwing exception.';
        }

        this.log('StropheConnection: connect: id=' + id);

        if (this.connection) {
            // Thinking we should really NOT null-out the connection but instead reset it.
            this.connection.reset();
        }
        else {
            this.log('WARN: connection was null and should not be.');
            // We don't have a Strophe Connection at all yet.
            this.connection = new Strophe.Connection(this.boshconn);
        }

        // Anonymous XMPP connections are characterized by no password and a username which is
        // only @hostname.domain
        if (this.pw === '' && this.id.charAt(0) === '@') {
            this.bAnonymous = true;
        }
        else if (pw === '' || pw === null) {
            this.log('StropheConnection: connect: WARN: Must be on a failed re-attach. No password for user ' + this.id);
            // Should we do anything here or just let it play out to AUTHFAIL or DISCONNECTED.
        }

        this.numConnects += 1;
        this.log('Connecting(' + this.numConnects + ') ...');

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

        this.log('StropheConnection: handleDisconnect: processing.');

        this.log('WARN: INCOMPLETE. FIX ME.');
        if (this.causeConnfail) {
            this.log('INFO: CONNFAIL led us to DISCONNECTED.');
            this.autoConnect(); // Attempt to re-connect.
        }

        this.causeAuthfail = false;
        this.causeConnfail = false;
    },

    conn_callback: function(status, err) {
        if (err === 'item-not-found') {
            this.log('conn_callback: BOSH responded with item-not-found. Connection is invalid now.');
            this.forgetReconnectInfo();
            if (this.connection) {
                this.connection.reset();
            }

            // Attempt to auto-connect (via stored info or given id/pw)
            // If that's not successful, then we're in a world of hurt.
            if (!this.autoConnect()) {
                // We need to inform someone that we're in a bad situation.
                this.log('WARN: BOSH error + no login info -- calling status hopefully to resolve.');
                this.statusCallback(status);
            }
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
                this.handleDisconnect();
                break;
            case Strophe.Status.AUTHENTICATING:
                this.log('GoCastJS.StropheConnection: AUTHENTICATING');
                break;
            case Strophe.Status.CONNECTING:
                this.log('GoCastJS.StropheConnection: CONNECTING');
                break;
            case Strophe.Status.ATTACHED:
                this.log('GoCastJS.StropheConnection: ATTACHED');
                this.saveLoginInfo();
                this.connection.addHandler(this.privateSetupPingHandler.bind(this), 'urn:xmpp:ping', 'iq', 'get');
                break;
            case Strophe.Status.DISCONNECTING:
                this.log('GoCastJS.StropheConnection: DISCONNECTING');
                // Save off our rid/jid/sid here - as we aren't disconnected yet. Last chance?
                // or might this just give us more bogus saved login info?
                this.saveLoginInfo();
                break;
            case Strophe.Status.CONNFAIL:
                this.log('GoCastJS.StropheConnection: CONNFAIL');
                this.causeConnfail = true;
                this.saveLoginInfo();
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

    privateSetupPingHandler: function(iq) {
        var pong = $iq({to: $(iq).attr('from'), id: $(iq).attr('id'), type: 'result'});
//        this.log('StropheConnection: Received PING - Sending pong...');
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
            this.connection.reset();
        }
        else {
            this.log('WARN: connection was null and should not be.');
            // We don't have a Strophe Connection at all yet.
            this.connection = new Strophe.Connection(this.boshconn);
        }

        this.numConnects += 1;
        this.log('StropheConnection: Re-attaching(' + this.numConnects + ') -- jid=' + jid + ', sid=' + sid + ', rid=' + rid);

        // Once we are primed for re-attaching, we should forget this info. If it does wind
        // up being good, we'll get a new rid/jid/sid upon ATTACHED or CONNECTED to save.
        // And if we don't get that far due to other failures, then we shouldn't re-try this rid/jid/sid
        // anyway.
        this.forgetReconnectInfo();

        this.id = jid;
        this.pw = '';

        try {
            this.connection.attach(jid, sid, rid, this.conn_callback.bind(this));
        }
        catch(e) {
            console.log('CATCH: ERROR on attach() attempt: ' + e);
        }
    },

    debugXML: function(bEnable) {
        if (bEnable === true || bEnable === null || bEnable === undefined) {
            this.connection.rawInput = function(data) {
                if ($(data).children()[0]) {
                    this.log("RAW-IN:", $(data).children()[0]);
                }
                else {
                    this.log("RAW-IN:", $(data));
                }
            };

            this.connection.rawOutput = function(data) {
                if ($(data).children()[0]) {
                    this.log("RAW-OUT:", $(data).children()[0]);
                }
                else {
                    this.log("RAW-OUT:", $(data));
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
                this.connection.addHandler(handler, ns, name, type, id, from, options);
            }
            catch(e) {
                console.log('CATCH: ERROR on addHandler() attempt: ' + e);
            }
        }
        else {
            this.log('StropheConnection: ERROR: Cannot addHandler() - no connection.');
        }
    },

    disconnect: function(reason) {
        if (this.connection) {
            try {
                this.connection.disconnect(reason);
            }
            catch(e) {
                console.log('CATCH: ERROR on disconnect() attempt: ' + e);
            }
        }
        else {
            this.log('StropheConnection: ERROR: Cannot disconnect() - no connection.');
        }
    },

    sendIQ: function(elem, callback, errback, timeout) {
        if (this.connection) {
            try {
                this.connection.sendIQ(elem, callback, errback, timeout);
            }
            catch(e) {
                console.log('CATCH: ERROR on sendIQ() attempt: ' + e);
            }
        }
        else {
            this.log('StropheConnection: ERROR: Cannot sendIQ() - no connection.');
        }
    }
};
