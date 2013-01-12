/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global Buffer */
'use strict';

var GoCast = GoCast || {};

GoCast.StropheConnection = function(boshconn, statusCallback, logFn) {
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
};

GoCast.StropheConnection.prototype = {
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
        if (this.hasLoginStored()) {
            this.bAnonymous = localStorage.bAnonymous;

    // RMW: In theory we are supposed to advance RID by one, but Chrome fails it while Firefox is ok. Sigh. No advancing...
    //               Callcast.reattach(Callcast.connection.jid, Callcast.connection.sid, new Number(Callcast.connection.rid) + 1, Callcast.conn_callback);
            this.privateReattach(localStorage.jid, localStorage.sid, localStorage.rid);

            return localStorage.jid;
        }
        else {
            return null;
        }
    },

    connect: function(id, pw) {
        this.id = id;
        this.pw = pw;

        if (this.connection) {
            // Thinking we should really NOT null-out the connection but instead reset it.
            this.connection.reset();
        }
        else {
            this.log('WARN: connection was null and should not be.');
            // We don't have a Strophe Connection at all yet.
            this.connection = new Strophe.Connection(this.boshconn);
        }

        if (this.pw === '') {
            this.bAnonymous = true;
        }

        this.numConnects += 1;
        this.log('Connecting(' + this.numConnects + ') ...');

        this.connection.connect(this.id, this.pw, this.conn_callback);
    },

    //
    // @brief Depending on how we arrived at the disconnected state will determine
    //        some of how we handle it. For instance, transiting through CONNFAIL
    //        will imply that we would probably want to try reattaching.
    //
    handleDisconnect: function() {

        this.log('ERROR: INCOMPLETE. FIX ME.');
        if (this.causeConnfail) {
            this.log('INFO: CONNFAIL led us to DISCONNECTED.');
            this.autoConnect(); // Attempt to re-connect.
        }

        this.causeAuthfail = false;
        this.causeConnfail = false;
    },

    conn_callback: function(status, err) {
        if (err === 'item-not-found') {
            this.log('Orig conn_callback: BOSH responded with item-not-found. Connection is invalid now.');
            this.forgetReconnectInfo();
            if (this.connection) {
                this.connection.reset();
            }

            // If we have a password (must be valid login) -- or we're anonymous (no jid node in id)
            // then we should just login again. Go.
            if (this.pw !== '' || this.id.split('@')[0].length === 0) {
                this.connect(this.id, this.pw);
            }
            else {
                // We need to inform someone that we're in a bad situation.
                this.log('WARN: BOSH error + no login info -- calling status hopefully to resolve.');
                this.statusCallback(status);
            }

            return;
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
                break;
            case Strophe.Status.DISCONNECTING:
                this.log('GoCastJS.StropheConnection: DISCONNECTING');
                // Save off our rid/jid/sid here - as we aren't disconnected yet. Last chance?
                // or might this just give us more bogus saved login info?
                // this.saveLoginInfo();
                break;
            case Strophe.Status.CONNFAIL:
                this.causeConnfail = true;
                this.log('GoCastJS.StropheConnection: CONNFAIL');
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

    privateReattach: function(jid, sid, rid) {
        if (!jid || !sid || !rid || !jid.split('@')[1])
        {
            this.log('Re-attach ERROR: RID/SID/JID is null. RID=' + rid + ', SID=' + sid + ', JID=' + jid);
            return;
        }

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
        this.log('Re-attaching(' + this.numConnects + ') -- jid=' + jid + ', sid=' + sid + ', rid=' + rid);

        // Once we are primed for re-attaching, we should forget this info. If it does wind
        // up being good, we'll get a new rid/jid/sid upon ATTACHED or CONNECTED to save.
        // And if we don't get that far due to other failures, then we shouldn't re-try this rid/jid/sid
        // anyway.
        this.forgetReconnectInfo();

        this.connection.attach(jid, sid, rid, this.conn_callback);
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
        if (this.connection) {
            if (bEnable === false) {
                this.connection.sync = false;
            }
            else {
                this.connection.sync = true;
            }
        }
    }
};
