/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global Buffer */
'use strict';

var GoCast = GoCast || {};

GoCast.StropheConnection = function(boshconn, statusCallback, logFn) {
    if (!boshconn || !statusCallback) {
        throw 'StropheConnection: ERROR: Bad invocation - must provide all required parameters.';
    }

    this.connection = null;
    this.id = null;
    this.pw = null;
    this.bAnonymous = true;

    this.numConnects = 0;

    this.boshconn = boshconn;
    this.statusCallback = statusCallback;

    if (logFn) {
        this.log = logFn;
    }
};

GoCast.StropheConnection.prototype = {
    isAnonymous: function() {
        return this.bAnonymous;
    },

    ForgetReconnectInfo: function() {
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

    hasLoginStored: function() {
        var rid, jid, sid, bAnonymous;

        if (typeof (Storage) !== 'undefined') {
            rid = localStorage.rid;
            jid = localStorage.jid;
            sid = localStorage.sid;
            bAnonymous = localStorage.bAnonymous;

            if (jid && jid.split('@')[1] && sid && rid) {
                this.rid = rid;
                this.jid = jid;
                this.sid = sid;
                this.bAnonymous = bAnonymous;

                return true;
            }
        }

        return false;
    },

    autoConnect: function() {
        if (this.hasLoginStored()) {
            this.bAnonymous = localStorage.bAnonymous;

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

    conn_callback: function(status, err) {
        if (err === 'item-not-found') {
            this.log('Orig conn_callback: BOSH responded with item-not-found. Connection is invalid now.');
            this.ForgetReconnectInfo();
            if (Callcast.connection) {
                Callcast.connection.pause();
                Callcast.connection = null;
            }

            if (this.pw !== '') {
                this.connect(this.id, this.pw);
            }
            else {
                // Gotta inform above that we're dead.

            }

            return;
        }

        if (err) {
            Callcast.log('conn_callback(' + this.numConnects + '): Status: ' + status + ' Err:', err);
        }
        else {
            Callcast.log('conn_callback(' + this.numConnects + '): Status: ' + status + ' No Err.');
        }

        Callcast.conn_callback_guts(status);
    },

    conn_callback_guts: function(status) {
        Callcast.log('conn_callback(' + this.numConnects + '): RID: ' + Callcast.connection.rid + ' SID: ' + Callcast.connection.sid);


        switch(status) {
            case Strophe.Status.CONNECTED:
                break;
            case Strophe.Status.DISCONNECTED:
                break;
            case Strophe.Status.AUTHENTICATING:
            case Strophe.Status.CONNECTING:
            case Strophe.Status.ATTACHED:
            case Strophe.Status.DISCONNECTING:
            case Strophe.Status.CONNFAIL:
            case Strophe.Status.AUTHFAIL:
                break;
            default:
                break;
        }



         if (status === Strophe.Status.CONNECTED) {
             Callcast.log('XMPP/Strophe Finalizing connection and then triggering connected...');
             Callcast.finalizeConnect();
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Connected');
             }
             $(document).trigger('connected');
         } else if (status === Strophe.Status.AUTHENTICATING) {
             Callcast.log('XMPP/Strophe Authenticating...');
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Authenticating');
             }
         } else if (status === Strophe.Status.CONNECTING) {
             Callcast.log('XMPP/Strophe Connecting...');
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Connecting');
             }
         } else if (status === Strophe.Status.ATTACHED) {
             Callcast.log('XMPP/Strophe Re-Attach of connection successful. Triggering re-attached...');
            // Determine if we're in a 'refresh' situation and if so, then re-attach.
            if (typeof (Storage) !== 'undefined' && sessionStorage.room)
            {
                // We need to force a LeaveSession and setup video state too.
                if (typeof (Storage) !== 'undefined') {
                    Callcast.room = sessionStorage.room;
                    Callcast.nick = sessionStorage.nick;

                    if (sessionStorage.bUseVideo === 'true' || sessionStorage.bUseVideo === 'false') {
                        Callcast.bUseVideo = sessionStorage.bUseVideo;
                    }

                    if (sessionStorage.bUseMicrophone === 'true' || sessionStorage.bUseMicrophone === 'false') {
                        Callcast.bUseMicrophone = sessionStorage.bUseMicrophone;
                    }
                }

                Callcast.LeaveSession();
            }

             setTimeout(function() {
                 Callcast.finalizeConnect();
                 $(document).trigger('re-attached');
                 $(document).trigger('connected');
                 if (Callcast.Callback_ConnectionStatus) {
                    Callcast.Callback_ConnectionStatus('Re-Attached');
                 }

             }, 500);
         } else if (status === Strophe.Status.DISCONNECTED) {
             Callcast.log('XMPP/Strophe Disconnected.');
             Callcast.disconnect();
             $(document).trigger('disconnected');
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Disconnected');
             }
         } else if (status === Strophe.Status.DISCONNECTING) {
             Callcast.log('XMPP/Strophe is Dis-Connecting...should we try to re-attach here? TODO:RMW');
             Callcast.RememberCurrentJid();
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Disconnecting');
             }
         } else if (status === Strophe.Status.CONNFAIL) {
             Callcast.log('XMPP/Strophe reported connection failure...attempt to re-attach...');
             Callcast.log('-- Not actually doing anything here yet. TODO: RMW');
             Callcast.RememberCurrentJid();

             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Connection failed');
             }
    // RMW: In theory we are supposed to advance RID by one, but Chrome fails it while Firefox is ok. Sigh. No advancing...
    //               Callcast.reattach(Callcast.connection.jid, Callcast.connection.sid, new Number(Callcast.connection.rid) + 1, Callcast.conn_callback);

    // RMW: SPECIFICALLY SKIPPING RE-ATTACH on CONNFAIL right now. Think it's causing issues.
            Callcast.log('Attempting a reattach() here. Starting doing this again on Aug 2 2012.');
            Callcast.reattach(Callcast.connection.jid, Callcast.connection.sid, Callcast.connection.rid, Callcast.conn_callback);


    //           alert("NOTICE -- attempted to auto-re-attach after connection failure. Did we succeed?");
         } else if (status === Strophe.Status.AUTHFAIL) {
             Callcast.RememberCurrentJid();
             Callcast.disconnect();
             $(document).trigger('disconnected');
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Disconnected');
             }
             alert('XMPP/Strophe Authentication failed. Bad password or username.');
         }
         else {
            Callcast.log('XMPP/Strophe connection callback - unhandled status = ' + status);
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Unknown status');
             }
         }
    },

    privateReattach: function(jid, sid, rid, cb) {
        if (!jid || !sid || !rid || !jid.split('@')[1])
        {
            this.log('Re-attach ERROR: RID/SID/JID is null. RID=' + rid + ', SID=' + sid + ', JID=' + jid);
            return;
        }

        if (this.connection)
        {
            this.connection.pause();
            this.connection = null;
        }

        this.connection = new Strophe.Connection(this.boshconn);
        this.connection.reset();

        this.numConnects += 1;
        this.log('Re-attaching(' + this.numConnects + ') -- jid=' + jid + ', sid=' + sid + ', rid=' + rid);

        this.connection.attach(jid, sid, rid, this.conn_callback);

        if (cb) {
          cb();
        }
    },

    debugXML: function(bEnable) {
        if (bEnable === true || bEnable === null || bEnable === undefined) {
            this.connection.rawInput = function(data) {
                if ($(data).children()[0]) {
                    Callcast.log("RAW-IN:", $(data).children()[0]);
                }
                else {
                    Callcast.log("RAW-IN:", $(data));
                }
            };

            this.connection.rawOutput = function(data) {
                if ($(data).children()[0]) {
                    Callcast.log("RAW-OUT:", $(data).children()[0]);
                }
                else {
                    Callcast.log("RAW-OUT:", $(data));
                }
            };
        }
        else {
            this.connection.rawInput = function() {};
            this.connection.rawOutput = function() {};
        }
    }

};
