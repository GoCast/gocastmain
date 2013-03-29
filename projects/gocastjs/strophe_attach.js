/* Requires:
   Strophe
   JQuery

   */

//
// @brief GoCastJS.StropheAttach is a stand-alone connection to XMPP servers. It wraps
//        Strophe with the following features:
//        1. Has its own over-ride .log function
//        2. Automatically responds to 'ping' requests from the server.
//        3. Wraps critical Strophe functions in try/catch blocks to avoid
//           prior issues with Strophe.
//        4. Hooks into Strophe's log function to output STROPHE-LOG: entries to better
//           keep track of what's going on down in the Strophe library.
//        5. debugXML() function will allow enabling full blown xml logs.
//        6. Handles on-before-unload for the window and saves the rid/jid/sid if still valid.
//
// opts object MUST contain:
//   boshurl: absolute or relative path to the bosh server '/xmpp-httpbind' is normal.
//   statusCallback: function(status) to be called as connection changes over time.
// opts MAY contain:
//   logFn: substitute function for logging errors, etc.
//

/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global Buffer */
'use strict';

var GoCastJS = GoCastJS || {};

GoCastJS.StropheAttach = function(opts) {
    var self = this;

    this.log('New GoCastJS.StropheAttach.');

    if (!opts || !opts.boshurl || !opts.statusCallback) {
        throw 'StropheAttach: ERROR: Bad invocation - must provide all required parameters.';
    }

    this.isConnected = false;

    this.bAnonymous = true;

    this.public_room_node = opts.public_room_node;
    this.isSubscribed = false;
    this.subCallback = null;

    this.numConnects = 0;
    this.causeConnfail = false;
    this.causeTerminating = false;

    this.boshurl = opts.boshurl;
    this.statusCallback = opts.statusCallback;

    this.disconnectTimer = null;

    if (opts.logFn) {
        this.log = opts.logFn;
    }

    // We don't have a Strophe Connection at all yet.
    this.connection = new Strophe.Connection(this.boshurl);

//    this.debugXML();
    if (typeof (Storage) !== 'undefined' && (localStorage.debugXML || localStorage.debugxml)) {
        this.debugXML();
    }

    // Custom status item.
    Strophe.Status.TERMINATED = 99;

    Strophe.log = function(level, msg) {
        if (level > 3) {
            console.error('STROPHE-LOG: level:' + level + ', msg: ' + msg);
        }
        else if (level > 1) {
            console.log('STROPHE-LOG: level:' + level + ', msg: ' + msg);
        }
    };

    $(window).on('beforeunload', function() {
        self.log('StropheAttach: Before Unload.');
        if (self.connection && self.connection.connected && self.connection.authenticated) {
            self.log('Disconnecting XMPP connection.');
            self.connection.disconnect();
            self.connection.flush();
        }
    });
};

GoCastJS.StropheAttach.prototype = {
    log: function(arg0, arg1, arg2) {
        console.log('StropheAttach: ', arg0, arg1 || '', arg2 || '');
    },

    //
    // @brief Depending on how we arrived at the disconnected state will determine
    //        some of how we handle it. For instance, transiting through CONNFAIL
    //        will imply that we would probably want to try reattaching.
    //
    handleDisconnect: function() {

        // This is called when we are DISCONNECTED

        this.log('StropheAttach: handleDisconnect: processing.');

        this.isConnected = false;
        this.reset('Full disconnection - heading for TERMINATED.');
        this.statusCallback(Strophe.Status.TERMINATED);

//TODO:RMW REVIEW - should we print out a cause - at least in a commented-debug print?
        this.causeConnfail = false;
        this.causeTerminating = false;
    },

    conn_callback: function(status, err) {
        var self = this;

        if (err === 'item-not-found') {
            this.log('conn_callback: BOSH responded with item-not-found. Connection is now invalid.');
        }

        if (err) {
            this.log('conn_callback(' + this.numConnects + '): Status: ' + status + ' Err:', err);
        }
        else {
            this.log('conn_callback(' + this.numConnects + '): Status: ' + status + ' No Err.');
        }

        switch(status) {
            case Strophe.Status.CONNECTED:
                this.log('GoCastJS.StropheAttach: CONNECTED - ERROR - should not happen.');
                this.isConnected = true;
                break;
            case Strophe.Status.DISCONNECTED:
                this.log('GoCastJS.StropheAttach: DISCONNECTED');
                this.isConnected = false;

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
                this.isConnected = false;
                this.log('GoCastJS.StropheAttach: AUTHENTICATING - ERROR - should not happen');
                break;
            case Strophe.Status.CONNECTING:
                this.isConnected = false;
                this.log('GoCastJS.StropheAttach: CONNECTING - ERROR - should not happen.');
                break;
            case Strophe.Status.ATTACHED:
                this.log('GoCastJS.StropheAttach: ATTACHED');
                this.isConnected = true;

                this.privateDoSubscribe();
                this.privatePingServer();
                this.connection.addHandler(this.privateSetupPingHandler.bind(this), 'urn:xmpp:ping', 'iq', 'get');
                break;
            case Strophe.Status.DISCONNECTING:
                this.log('GoCastJS.StropheAttach: DISCONNECTING');
                this.isConnected = false;

                // If we have a timer already running (likely from CONNFAIL), clear it and restart.
                if (this.disconnectTimer) {
                    clearTimeout(this.disconnectTimer);
                }
                this.disconnectTimer = setTimeout(function() {
                    // If we get here, then DISCONNECTING was not followed in a timely manner
                    // by DISCONNECTED. So, we need to make a judgement call and call this 'bad'.
                    // As such, we will trigger a TERMINATED upwards and forget login info.
                    self.disconnectTimer = null;

                    self.reset('DISCONNECTING_TIMEOUT - Never reached DISCONNECTED.');
                    self.statusCallback(Strophe.Status.TERMINATED);
                }, 1000);

                break;
            case Strophe.Status.CONNFAIL:
                this.log('GoCastJS.StropheAttach: CONNFAIL');
                this.isConnected = false;
                this.causeConnfail = true;
                this.disconnectTimer = setTimeout(function() {
                    // If we get here, then DISCONNECTING was not followed in a timely manner
                    // by DISCONNECTED. So, we need to make a judgement call and call this 'bad'.
                    // As such, we will trigger a TERMINATED upwards and forget login info.
                    self.disconnectTimer = null;

                    self.reset('DISCONNECTING_TIMEOUT_CONNFAIL - Never reached DISCONNECTED.');
                    self.statusCallback(Strophe.Status.TERMINATED);
                }, 1000);
                break;
            case Strophe.Status.AUTHFAIL:
                this.isConnected = false;
                this.log('GoCastJS.StropheAttach: AUTHFAIL - ERROR - should not happen.');
                break;
            default:
                this.log('GoCastJS.StropheAttach: ERROR: UNKNOWN STATUS: ' + status);
                break;
        }

        this.statusCallback(status);
    },

    privatePingServer: function() {
        var ping = $iq({to: this.xmppserver, type: 'get'}).c('ping', {xmlns: 'urn:xmpp:ping'});
        this.log('StropheAttach: Pinging Server as a health-check.');
        this.send(ping);
        this.flush();
    },

    privateSetupPingHandler: function(iq) {
        var pong = $iq({to: $(iq).attr('from'), id: $(iq).attr('id'), type: 'result'});
//        this.log('StropheAttach: Received PING - Sending pong...');
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
    attach: function(obj) {
        var rid, jid, sid;

        if (!obj.jid || !obj.sid || !obj.rid || !obj.jid.split('@')[1])
        {
            this.log('Re-attach ERROR: RID/SID/JID is null. RID=' + obj.rid + ', SID=' + obj.sid + ', JID=' + obj.jid);
            return;
        }

        jid = obj.jid;
        sid = obj.sid;

        // Auto-advance the rid.
        // NOTE: Seems auto-advance causes problems. Skipping for now.
        rid = parseInt(obj.rid, 10) - 1;
//        rid = parseInt(inRid, 10);
        // rid = parseInt(inRid, 10) + 1;

        if (this.connection)
        {
            this.reset('attach-again');
        }
        else {
            this.log('WARN: connection was null and should not be.');
            // We don't have a Strophe Connection at all yet.
            this.connection = new Strophe.Connection(this.boshurl);
        }

        this.numConnects += 1;
        this.log('StropheAttach: Attaching(' + this.numConnects + ') -- jid=' + jid + ', sid=' + sid + ', rid=' + rid);

        try {
            this.connection.attach(jid, sid, rid, this.conn_callback.bind(this));
        }
        catch(e) {
            console.log('CATCH: ERROR on attach() attempt: ' + e);
        }
    },

    debugXML: function(bEnable) {
        var self = this;

        if (!this.connection) {
            this.log('debugXML: ERROR - no connection presently. Cannot set debug mode.');
            return false;
        }

        if (bEnable === true || bEnable === null || bEnable === undefined) {
            this.connection.rawInput = function(data) {
                $.each($(data), function(iter, val) { self.log('RAW-IN: ', val); });
            };

            this.connection.rawOutput = function(data) {
                $.each($(data), function(iter, val) { self.log('RAW-OUT: ', val); });
            };
        }
        else {
            this.connection.rawInput = function() {};
            this.connection.rawOutput = function() {};
        }
    },

    setSync: function(bEnable) {
        this.log('StropheAttach: setSync(' + bEnable + ')');

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
            this.log('StropheAttach: ERROR: Cannot send() - no connection.');
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
            this.log('StropheAttach: ERROR: Cannot addHandler() - no connection.');
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
            this.log('StropheAttach: ERROR: Cannot disconnect() - no connection.');
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
            this.log('StropheAttach: ERROR: Cannot flush() - no connection.');
        }
    },

    getUniqueId: function(suffix) {
        if (this.connection) {
            return this.connection.getUniqueId(suffix);
        }
        else {
            this.log('StropheAttach: ERROR: Cannot getUniqueId() - no connection.');
            return null;
        }
    },

    getJid: function() {
        if (this.connection) {
            return this.connection.jid;
        }
        else {
            this.log('StropheAttach: ERROR: Cannot getJid() - no connection.');
            return null;
        }
    },

    sendIQ: function(elem, callback, errback, timeout) {
        var ret;
        if (this.connection) {
            try {
                ret = this.connection.sendIQ(elem, callback, errback, timeout);
                this.connection.flush();    // With IQs, we want them sent immediately.
                return ret;
            }
            catch(e) {
                console.log('CATCH: ERROR on sendIQ() attempt: ' + e);
                return null;
            }
        }
        else {
            this.log('StropheAttach: ERROR: Cannot sendIQ() - no connection.');
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
            this.log('StropheAttach: ERROR: Cannot reset() - no connection.');
            return null;
        }
    },

    privateOnEvent: function(event) {
        var data;

        data = $(event).find('pubroom'); //.text();

        console.error('privateOnEvent: We have a subscribe event.');

        if (data.length) {
            // Should have an array of public room entries
            // <pubroom name="blah" num="3"/><pubroom name="foo" num="5"/>
//            this.log('privateOnEvent: length: ' + data.length);
//            this.log('privateOnEvent: data: ', $(data));
            if (this.subCallback) {
                try {
                    this.subCallback(data);
                }
                catch(e) {
                    this.log('privateOnEvent: Exception-Catch-Callback error: ' + e + ', handler: ' + this.subCallback);
                }
            }
        }

        return true;
    },

    privateOnSubscribe: function(sub) {
        this.isSubscribed = true;
        this.log('Subscribed to public room node.');
        return true;
    },

    privateDoSubscribe: function() {
        var self = this, dosubscribe, unsubTimer = null;

        dosubscribe = function() {
            if (unsubTimer) {
                clearTimeout(unsubTimer);
                unsubTimer = null;
            }

            if (self.public_room_node && (self.subCallback || localStorage.forceSubscribe)) {
                console.error('Subscribing to: ' + self.public_room_node);
                self.connection.pubsub.subscribe(
                    self.public_room_node,
                    { 'pubsub#max_items': '1' },
                    self.privateOnEvent.bind(self),
                    self.privateOnSubscribe.bind(self),
                    function(err) {
                        var code, type, errsub;
                        code = $(err).children('error').attr('code');
                        type = $(err).children('error').attr('type');
                        errsub = $(err).children('error').children();

                        if (errsub[0].localName === 'item-not-found') {
                            // This node doesn't exist yet...
                            self.log('ERROR: Subscribe-Node: ' + self.public_room_node + ' does not exist yet.');
                        }
                        else if ($(err).children('error')) {
                            self.log('ERROR: Subscribe-Node: Code: ' + code + ', Type: ' + type + ', sub-name: ' + errsub[0].localName);
                        }
                        else {
                            self.log('ERROR: Subscribe-Node: Unknown error stanza came back.');
                        }
                    }
                );
            }
        };

        unsubTimer = setTimeout(function() {
            console.log('**WARNING** - Unsubscribe never returned success nor failure. Subscribing based on timeout.');
            dosubscribe();
        }, 5000);

        this.connection.pubsub.unsubscribe(
            this.public_room_node,
//            Strophe.getBareJidFromJid(this.connection.jid),
            this.connection.jid,
            null,
            function() {
                console.error('ALL GOOD');
                dosubscribe();
            },
            function(err) {
                console.error(err);
                dosubscribe();
            });

        if (!this.isConnected) {
            throw 'privateDoSubscribe: Must be connected first.';
        }

    },

    subscribePublicRooms: function(cbSuccess) {
        // TODO - need to deal with
        //  what if we're not connected yet? bDesireSubscribe?
        //  If no .muc plugin
        //  If already subscribed

        this.subCallback = cbSuccess;

        // If we are already connected, then do the subscribe now.
        // Otherwise, we'll defer this subscription to when we get connected.
        if (this.isConnected) {
            this.privateDoSubscribe();
        }
        else {
            this.log('subscribePublicRooms: INFO: Subscription deferred until connected.');
        }

    }

};
