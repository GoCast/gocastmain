/**
 * Callcast - protocol utilizing general xmpp as well as disco and MUC.
 *
 * Copyright 2012 GoCast - www.GoCast.it
 * Author: Robert Wolff - rwolff@gocast.it / bob.wolff68@gmail.com
 *
 * Purpose: Use a more robust server signalling protocol than the current example peerconnection*
 *   version in webrtc/libjingle examples. The TCP connection in peerconnection is not very
 *   robust against dropped TCP connections and isn't a 'standard' either. Utilizing a standard
 *   XMPP server with a BOSH connection, we can envision a more flexible and further reaching
 *   approach which gives us a more natural call/session control, group controls, and built-in
 *   instant messaging as well as other flexible mechanisms for add-on features.
 *
 * See callcast.html for a very simple (poor UI) sample of this signalling.
 *
 * TODO: a) Remove the rest of the UI from the Callcast object. Currently .Makecall() utilizes
 *          jqueryUI dialogs as does the reception of an incoming call.
 *       b) Change code to be a Strophe plugin which will help in (a) above making the calling
 *          application cope with all UI items.
 *       c) Update use of PeerConnection from rev 1080 of webrtc to ROAP/JSEP model when appropriate.
 *       d) Remove the custom OnMessage() message modification in the plugin today. Currently,
 *          the offer message is prepended with the jid of the user to which it belongs + '~'
 *       e) Use DISCO to determine if a jid is capable of handling an invite. Otherwise, possibly
 *          send them a link to the plugin or to a webrtc resource.
 *
 * How it is done:
 *  General Theory:
 *    Use MUC chat rooms for session engagement, presence, and signalling between peers for call
 *    setup. Use directed chat for invitations to join an existing/new room/session outside of
 *    MUC. And once a person joins the MUC room, they have at that point said "accept" to the
 *    call and as such, when they enter the room, it is their responsibility to make a new
 *    PeerConnection with each of the existing members of the call. So, the new person sends
 *    an 'initiate' with their signalling info to each existing entity and anyone who is already
 *    in the room will automatically respond with their information by making a Peerconnection
 *    with the new person.
 *
 *  Joining an existing MUC room:
 *    If a user joins a MUC room and they are Callcast enabled, they take the inbound presence
 *    list given to them upon entry and they send a directed "chat" message with a stanza inside it
 *    of <initiating >Signalling message offer from PeerConnection</initiating>. This stanza
 *    is sent to each of the existing members of the room. Upon reception of an <initiating>,
 *    the message body is used to complete the call via peer_connection.processSignalingMessage().
 *
 *  Inviting a new person to a call:
 *    Using the chat message, we simply formulate an invitation with our namespace. When a Callcast
 *    enabled peer receives such a message, they can choose to prompt the user to accept the
 *    incoming call and if they do accept it, the invitation had the MUC room to join as part of
 *    the invitation. The new entrant then joins the room and the flow of events is the same
 *    as above (Joining an existing MUC room:)
 *
 *
 *  Customization to existing PeerConnection.onsignallingmessage()
 *    It is necessary for us to know which Peerconnection message belongs with which peer, and
 *    the onsignallingmessage(message) does not contain any identification natively. So, we
 *    decided to prepend "jid~" to the exisitng message so that we can properly identify which
 *    jid is being signaled. Each PeerConnection keeps track of which jid they belong to via
 *    the change to Init() below.
 *  Customization to existing PeerConnection.init()
 *    In order to keep track and 'pair' each PeerConnection to a particular jid, init() is used
 *    to make that pairing so that when onsignallingmessage is called, it is called with the
 *    identifying jid prepended to the signalling message.
 *
 */

/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global Buffer */
'use strict';

var GoCastJS = GoCastJS || {};

//
//
// B Q U E U E - Buffer Queue
//
//
GoCastJS.BQueue = function(maxBytes) {
    this.q = null;
    this.length = null;
    this.maxLength = maxBytes;

    this.clear();
};

GoCastJS.BQueue.prototype.clear = function(newMax) {
    this.q = [];
    this.length = 0;

    if (newMax) {
        this.maxLength = newMax;
    }
};

GoCastJS.BQueue.prototype.dump = function(msg) {
    var i, all = '',
        len = this.q.length;

    for (i = 0; i < len; i += 1)
    {
        all += this.q[i];
    }

    return all;
};

GoCastJS.BQueue.prototype.log = function(msgin) {
    var msg = msgin,
        i, len;
 //   var stats = '';

    if (arguments.length > 1) {
 //       msg = JSON.stringify(arguments);
        len = arguments.length;

        msg = '';

        for (i = 0; i < len; i += 1)
        {
            msg += arguments[i];        // TODO:JK - possibly walk the elements here.
        }
    }

    if (typeof msg !== 'string') {
        return false;
    }

//    stats = 'log: pre:' + this.length + ', in:' + msg.length + ', post-nodrop:' + (this.length+msg.length);

    this.q.push(msg + '\n');
    this.length += msg.length + 1;

    // Drop the head of the Queue until we are 'in spec' on total length.
    while(this.length > this.maxLength && this.q.length) {
        this.length -= this.q.shift().length;
    }

 //   stats += ', post-drop:' + this.length;
 //   console.log('DEBUG: ' + stats);

    // If we had to delete every entry just to get below the threshold, that's an error.
    if (!this.q.length) {
        return false;
    }

    return true;
};

//
//
//
// l o g D a t e - Support for date/time-stamp logging.
//
//
//

GoCastJS.pad = function(num, size) {
    var s = '000000000' + num;
    return s.substr(s.length - size);
};

GoCastJS.pad2 = function(num) { return GoCastJS.pad(num, 2); };

//
// Return Date/Time as mm-dd-yyyy hh:mm::ss
//
GoCastJS.logDate = function() {
    var d = new Date();

    return GoCastJS.pad2(d.getMonth() + 1) + '-' + GoCastJS.pad2(d.getDate()) + '-' + d.getFullYear() + ' ' +
            GoCastJS.pad2(d.getHours()) + ':' + GoCastJS.pad2(d.getMinutes()) + ':' + GoCastJS.pad2(d.getSeconds());
};



//
// Returns bytes out of the logs up to max # bytes.
// Only returns integral line items however.
// Returns null if no lines available.
//
GoCastJS.BQueue.prototype.removeLinesWithMaxBytes = function(max) {
    var out = '',
        removed = 0;

    if (!this.q.length) {
//        this.log('DEBUG: BQueue::getLinesWithMaxBytes: Empty Queue');
        return null;
    }

    while (this.q.length && out.length + this.q[0].length <= max)
    {
        this.length -= this.q[0].length;
        out += this.q.shift();
        removed += 1;
    }

//    this.log('DEBUG: BQueue::getLinesWithMaxBytes: Removed ' + removed + ' lines. Returned ' + out.length + ' bytes.');
    return out;
};

GoCastJS.BQueue.prototype.getSize = function() {
    return this.length;
};


// Create a 1-MB queue buffer for consolidated logging.
var logQ = new GoCastJS.BQueue(1024*1024);

var Callcast = {
    PLUGIN_VERSION_CURRENT: 0.0,
    PLUGIN_VERSION_REQUIRED: 0.0,
    PLUGIN_VERSION_CURRENT_MAC: 1.33,
    PLUGIN_VERSION_REQUIRED_MAC: 1.33,
    PLUGIN_VERSION_CURRENT_WIN: 1.33,
    PLUGIN_VERSION_REQUIRED_WIN: 1.33,
    PLUGIN_VERSION_CURRENT_LINUX: 1.34,
    PLUGIN_VERSION_REQUIRED_LINUX: 1.34,
    NOANSWER_TIMEOUT_MS: 6000,
    NS_CALLCAST: 'urn:xmpp:callcast',
    Callback_AddSpot: null,
    Callback_RemoveSpot: null,
    Callback_SetSpot: null,
    Callback_AddSpotForParticipant: null,
    Callback_AddPluginToParticipant: null,
    Callback_RemovePluginFromParticipant: null,
    Callback_RemoveSpotForParticipant: null,
    Callback_AddCarouselContent: null,
    Callback_RemoveCarouselContent: null,
    Callback_ReadyState: null,
    Callback_ConnectionStatus: function() {},
    Callback_OnEffectApplied: null,
    Callback_OnNicknameInUse: null,
    connection: null,
    localplayer: null,
    localplayerLoaded: false,
    participants: {},
    room: '',
    roomjid: '',
    roomlist: {},
    nick: '',
    joined: false,
    bUseVideo: true,
    bUseMicrophone: true,
    WIDTH: 256,
    HEIGHT: 192,
    overseer: null,
    presenceBlob: null,
    fbsr: '',
    fbaccesstoken: '',
    fb_sent_pres: false,
    sessionInfo: {},
    mediaHints: {audio: false, video: false},
    bPluginLoadedSuccessfully: false,

    // Block of variables which are now being handled by the CallcastSettings
    // object at init() time. Must call Callcast.init() before proceeding.
    CALLCAST_XMPPSERVER: null,
    CALLCAST_ROOMS: null,
    AT_CALLCAST_ROOMS: null,
//    STUNSERVER: 'stun.l.google.com',
    STUNSERVER: null,
    FEEDBACK_BOT: null,
    STUNSERVERPORT: null,
    ROOMMANAGER: null,
    SWITCHBOARD_FB: null,
    LOGCATCHER: null,
    FILECATCHER: null,

    init: function(inServer, url) {
        var boshurl = url || '/xmpp-httpbind',
            server = inServer || window.location.hostname;

        if (this.connection) {
            throw 'init: StropheConnection already exists. Calling init again? Not legal.';
        }

        if (this.settings) {
            throw 'init: settings already exists. Calling init again? Not legal.';
        }

        this.settings = new GoCastJS.CallcastSettings(server);
        this.settings.transferValues(this); // Set all the values in Callcast.* from settings

        this.connection = new GoCastJS.StropheConnection({ boshurl: boshurl,
                                                           xmppserver: this.CALLCAST_XMPPSERVER,
                                                           statusCallback: this.connStatusHandler.bind(this),
                                                           logFn: this.log});

    },

    WriteUpdatedState: function() {
        if (typeof (Storage) !== 'undefined')
        {
            this.RememberCurrentJid();

            if (this.connection.connection)
            {
                // Save rid/jid/sid inside the connection.
                this.connection.saveLoginInfo();

                sessionStorage.setItem('room', this.room);
                sessionStorage.setItem('nick', this.nick);
                sessionStorage.setItem('bUseVideo', this.bUseVideo);
                sessionStorage.setItem('bUseMicrophone', this.bUseMicrophone);
            }
            else
            {
                // Zero it out. The conneciton is not valid.
                this.SessionStorageClear();
            }
        }
        else
        {
            alert("Non-HTML5 browser. Might you consider an upgrade? No 'Storage' available for refresh.");
        }
    },

    CallStates: {
        NONE: 0,
        AWAITING_RESPONSE: 1,
        CONNECTED: 2
    },

    //
    // \brief External user sets this callback to be called when the server sends an 'addspot' command
    //      for programmatically being told to add a new spot to the carousel. The argument to this
    //      callback is the JSON object which was given by the original 'adder' of the spot. The only
    //      server-dicted requirement in this JSON object is the 'spotnumber' property which is used
    //      to give unique addressing to all spots in the carousel.
    //
    setCallbackForAddSpot: function(cb) {
        this.Callback_AddSpot = cb;
    },

    //
    // \brief External user sets this callback to be called when the server sends a 'removespot' command
    //      for programmatically being told to remove a spot from the carousel. The argument to this
    //      callback is the JSON object which was given by the original 'deleter' of the spot. The only
    //      requirement in this JSON object is the 'spotnumber' property which is used to give unique
    //      addressing to all spots in the carousel such that the callback knows which spot to delete.
    //      \note spotnumber should always be a valid (existing) spot as the server is responsible for
    //          ensuring this is the case.
    //
    setCallbackForRemoveSpot: function(cb) {
        this.Callback_RemoveSpot = cb;
    },

    setCallbackForSetSpot: function(cb) {
        this.Callback_SetSpot = cb;
    },

    setCallbackForAddSpotForParticipant: function(cb) {
        this.Callback_AddSpotForParticipant = cb;
    },

    setCallbackForAddPluginToParticipant: function(cb) {
        this.Callback_AddPluginToParticipant = cb;
    },

    setCallbackForRemovePluginFromParticipant: function(cb) {
        this.Callback_RemovePluginFromParticipant = cb;
    },

    setCallbackForRemoveSpotForParticipant: function(cb) {
        this.Callback_RemoveSpotForParticipant = cb;
    },

    setCallbackForAddCarouselContent: function(cb) {
        this.Callback_AddCarouselContent = cb;
    },

    setCallbackForRemoveCarouselContent: function(cb) {
        this.Callback_RemoveCarouselContent = cb;
    },

    setCallbackForCallback_ConnectionStatus: function(cb) {
        this.Callback_ConnectionStatus = cb;
    },

    setCallbackForCallback_OnEffectApplied: function(cb) {
        this.Callback_OnEffectApplied = cb;
    },

    setCallbackForCallback_OnNicknameInUse: function(cb) {
        this.Callback_OnNicknameInUse = cb;
    },
    //
    // \brief The supplied callback will be called whenever the peer connection readystate changes.
    //      The problem to wrestle with is that each participant has a readystate so there can be
    //      many callbacks.
    // \param cb - function to be called when state changes. Note that cb must allow for both a state
    //      change status and a participant name. function cb(state, nickname)
    //
    setCallbackForReadyState: function(cb) {
        this.Callback_ReadyState = cb;
    },

    //
    // Allows setting of contents in the carousel for non-live entities
    //
    // info JSON object is  {   id: a unique id (temporary for now),
    //                          image: url of the image to use (jpg/gif/png),
    //                          altText: the hover-text to show,
    //                          url: the url which will be used for opening a new browser window on click.
    //                      }
    //
    setCarouselContent: function(info) {
        if (this.Callback_AddCarouselContent) {
            this.Callback_AddCarouselContent(info);
        }
    },

    removeCarouselContent: function(info) {
        if (this.Callback_RemoveCarouselContent) {
            this.Callback_RemoveCarouselContent(info);
        }
    },

    NoSpaces: function(str) {
        return str ? str.replace(/ /g, '\\20') : null;
    },

    WithSpaces: function(str) {
        return str ? str.replace(/\\20/g, ' ') : null;
    },

    onErrorStanza: function(err) {
        var from = $(err).attr('from'),
            nick = Strophe.getResourceFromJid(from);
        if (nick) {
            nick = nick.replace(/\\20/g, ' ');
        }

        // Need to cope with a few error stanzas.

        // #1 - If a user becomes unavailable and we're sending signaling / invitation messages, we'll get an error.
        if ($(err).find('recipient-unavailable').length > 0) {
            Callcast.log('INFO: Recipient ' + nick + ' became unavailable.');
        }
        else if ($(err).find('conflict').length > 0)
        {
            Callcast.HandleNicknameConflict(Strophe.getBareJidFromJid(from), nick);
        }
        else if ($(err).find('service-unavailable').length > 0)
        {
            alert('Could not enter room. Likely maximum # of users\nreached in this room or roommanager is unavailable.');
            Callcast.LeaveSession(null, 'service-unavailable');
        }
//        else if ($(err).find('not-allowed').length > 0)
//        {
          // Handled inside PresHandler             $(document).trigger('room-creation-not-allowed', room);
//        }
        else if ($(err).find('registration-required').length > 0)
        {
            alert('Room is currently locked. You may attempt to KNOCK to request entry.');
            Callcast.LeaveSession(null, 'registration-required');
        }
        else if ($(err).find('forbidden').length > 0)
        {
            alert('Someone in the room has blocked your admission.\nKnocking is being ignored as well.');
            Callcast.LeaveSession(null, 'forbidden');
        }
        else
        {
            alert('Unknown Error Stanza: ' + $(err).getChild('error').text());
            Callcast.log($(err));
        }

        return true;
    },

    //
    // \brief This is the handler for when we are told by the server that our nickname is
    //          already being used. This is typically found when a network connection gets
    //          dropped and the rid/sid/jid are invalidated locally but the server still
    //          sees a 'ghost' user in the room. This can occur for a full minute and causes
    //          a bad user experience. To rectivy this, we will attempt to tell the server that
    //          we are really that ghost user and to kick that ghost out of the room so we can
    //          get back in.
    //
    HandleNicknameConflict: function(room, nick) {
        var self = this;

        // Need to prepare a 'subjidfornickname' command and wait for response.
        if (!this.GetOldJids()) {
            Callcast.LeaveSession(null, 'Nickname conflict');
            if (Callcast.Callback_OnNicknameInUse) {
                Callcast.Callback_OnNicknameInUse(nick.replace(/%20/g, ' '));
            }
        }
        else {
            this.RequestNickSubstitution(room, nick, function() {
                self.log('Nickname substitution succeeded.');
            }, function(err) {
                self.log('Nickname substitution failed. Err: ' + err);
                self.log('    Now we erase all prior jids and try to join once more.');

                self.ClearOldJids();

                // Now re-join. If we fail again, this time the error will 'stick' as we have no old jids.
                // Note: At this stage, 'room' is a full roomname with domain. Gotta prune it down for the call.
                self.JoinSession(room.split('@')[0], room);
            });
        }
    },

    DropAllParticipants: function() {
        var k;
        for (k in Callcast.participants) {
            if (Callcast.participants.hasOwnProperty(k)) {
                Callcast.participants[k].DropCall();
                delete Callcast.participants[k];
            }
        }

        Callcast.participants = {};
    },

    figurePlatformVersion: function() {
        if (this.PLUGIN_VERSION_CURRENT === 0.0)
        {
            // Figure out which platform we're on and use versions appropriately.
            if (navigator.appVersion.indexOf('Win') !== -1)
            {
                this.PLUGIN_VERSION_CURRENT = this.PLUGIN_VERSION_CURRENT_WIN;
                this.PLUGIN_VERSION_REQUIRED = this.PLUGIN_VERSION_REQUIRED_WIN;
            }
            else if (navigator.appVersion.indexOf('Mac') !== -1)
            {
                this.PLUGIN_VERSION_CURRENT = this.PLUGIN_VERSION_CURRENT_MAC;
                this.PLUGIN_VERSION_REQUIRED = this.PLUGIN_VERSION_REQUIRED_MAC;
            }
            else if (/linux/.test(navigator.userAgent.toLowerCase()))
            {
                this.PLUGIN_VERSION_CURRENT = this.PLUGIN_VERSION_CURRENT_LINUX;
                this.PLUGIN_VERSION_REQUIRED = this.PLUGIN_VERSION_REQUIRED_LINUX;
            }
            else {
                alert('Unsupported Operating System.');
            }
        }
    },

    pluginUpdateAvailable: function() {
        this.figurePlatformVersion();

        return this.localplayer ? this.GetVersion() < this.PLUGIN_VERSION_CURRENT : true;
    },

    pluginUpdateRequired: function() {
        this.figurePlatformVersion();

        return this.localplayer ? this.GetVersion() < this.PLUGIN_VERSION_REQUIRED : true;
    },

    GetVersion: function() {
        return this.localplayer ? parseFloat(this.localplayer.version) : null;
    },

    //
    // If this is never called, then nickname will be generated by your username in
    // your JID. For anonymous logins (and other situations) this is not optimal and so
    // setting the nickname allows more flexibility in MUC rooms.
    //
    // TODO - support live changing of nicknames.
    // Note: Currently this name needs to be set PRIOR to making a call or receiving a
    //       call. It will not CHANGE your nickname in a live sessions/MUC room.
    //
    SetNickname: function(mynick) {
        Callcast.nick = mynick;

        if (!this.fbsr || this.fbsr === '') {
            this.SendAdHocPres();
        }
    },

    SetUseVideo: function(v_use) {
        if (v_use === true) {
            this.bUseVideo = true;
        }
        else if (v_use === false) {
            this.bUseVideo = false;
        }
    },

    //
    // filter is one of: 'sepia', 'gray', or 'none'
    //
    SetVideoFilter: function(filter) {

        if (typeof(filter) === 'string' && this.localplayer && this.localstream && this.localstream.videoTracks) {
            this.localstream.videoTracks[0].effect = filter;
            if (this.Callback_OnEffectApplied) {
                this.Callback_OnEffectApplied(filter);
            }
            return true;
        }
        else {
            return false;
        }
    },

    //
    // info is JSON formatted. Expectation is:
    //  info.nick - nickname to modify size of.
    //  info.hasVid - if this variable is used/present, set video to this.(WIDTH,HEIGHT), else if false, set to 0,0
    //  info.width - if this is present AND info.height is present, set width,height to these values.
    //
    ShowRemoteVideo: function(info) {
        var nick = info.nick;
        nick = this.WithSpaces(nick);

        if (nick && this.participants[nick])
        {
            if (this.participants[nick].peer_connection)
            {
                if (info.width >= 0 && info.height >= 0)
                {
                    this.participants[nick].peer_connection.Width(info.width);
                    this.participants[nick].peer_connection.Height(info.height);
                }
                else if (info.hasVid === true)
                {
                    this.participants[nick].peer_connection.Width(this.WIDTH);
                    this.participants[nick].peer_connection.Height(this.HEIGHT);
                }
                else if (info.hasVid === false)
                {
                    this.participants[nick].peer_connection.Width(0);
                    this.participants[nick].peer_connection.Height(0);
                }
            }

        }
        else if (nick !== this.nick) {
            this.log('ShowRemoteVideo: nickname not found: ' + nick);
        }
   },

    IsVideoEnabled: function() {
        if (!this.mediaHints.video) {
            this.bUseVideo = false;
            return false;
        }
        else {
            return this.bUseVideo;
        }
    },

    IsVideoDeviceAvailable: function() {
        if (!this.mediaHints.video) {
            this.bUseVideo = false;
        }

        return this.mediaHints.video;
    },

    IsMicrophoneEnabled: function() {
        if (!this.mediaHints.audio) {
            return false;
        }
        else {
            if (this.localstream && this.localstream.audioTracks) {
                return this.localstream.audioTracks[0].enabled;
            }
            else {
                return false;
            }
        }
    },

    IsMicrophoneDeviceAvailable: function() {
        return this.mediaHints.audio;
    },

    SendLocalVideoToPeers: function(send_it) {
        // This is used to detect a change in video on/off condition later in the function.
        var old_bUseVideo = this.bUseVideo;

        // If media hints says we actually have no video or that 'none' is selected as the
        // video device, then we cannot send video, so we're going to short circuit send_it
        // in this case and reset it to false.
        if (!this.mediaHints.video && (send_it || send_it.width >= 0 || send_it.height >= 0)) {
            send_it = false;
        }

        // Backwards compatibility allows true/false as an input and also a JSON object {width: w, height: h}
        if (send_it === true || send_it === false) {
            this.bUseVideo = send_it;
        }

        // Turn on/off our preview based on this muting of video too.
        if (this.localplayer)
        {
            if (send_it !== true && send_it !== false && send_it.width >= 0 && send_it.height >= 0)
            {
                if (this.localplayer.width <= 1 || this.localplayer.height <= 1) {
                    this.MuteLocalVideoCapture(false);
                }

                this.localplayer.width = send_it.width;
                this.localplayer.height = send_it.height;

                this.bUseVideo = true;
            }
            else if (this.bUseVideo === true)
            {
                this.localplayer.width = this.WIDTH;
                this.localplayer.height = this.HEIGHT;
                this.MuteLocalVideoCapture(false);
            }
            else
            {
                this.MuteLocalVideoCapture();
                this.localplayer.width = 0;
                this.localplayer.height = 0;
            }

            // We only want to send a presence update when the video status changes
            // **OR** this is the first time to ever be online/joined.
            // The problem of first-time-online/joined is handled by the Presence handler.
            // It calls SendMyPresence() upon joining.
            // So we only need to worry about video on/off change.
            if (this.joined && (this.bUseVideo !== old_bUseVideo)) {
                this.SendMyPresence();
            }
        }
    },

    //
    // This JSON argument will be sent as part of presence information in SendMyPresence()
    //   <presence ...><x xmlns.../><info obj/></presence>
    //
    // obj is expected to be a JSON object.
    //
    setPresenceBlob: function(obj) {
        this.presenceBlob = obj;
    },

    SendMyPresence: function() {
        var pres, presobj = {};

        // Only send presence if we're officially in the room. Not before.
        if (!this.joined) {
            return false;
        }

        presobj.to = this.roomjid + '/' + this.NoSpaces(this.nick);

        if (this.bUseVideo === true || this.bUseVideo === false) {
            presobj.video = this.bUseVideo ? 'on' : 'off';
        }

        //
        // Let the other side know we are AV capable.
        //
        if (this.bPluginLoadedSuccessfully) {
            presobj.av = 'y';
        }

        pres = $pres(presobj).c('x', {xmlns: 'http://jabber.org/protocol/muc'});

        if (this.presenceBlob) {
            pres.up().c('info', this.presenceBlob);
        }

        this.log('SendMyPresence: ', pres.toString());
        this.connection.send(pres);
    },

    ToggleLocalVideoCapture: function() {
        if (this.localstream && this.localstream.videoTracks && this.localstream.videoTracks.length) {
            this.localstream.videoTracks[0].enabled = !(this.localstream.videoTracks[0].enabled);
        }
    },

    MuteLocalVideoCapture: function(bMute) {
        if (this.localstream && this.localstream.videoTracks && this.localstream.videoTracks.length) {
            this.localstream.videoTracks[0].enabled = (typeof (bMute) !== 'undefined') ? !bMute : false;
        }
    },

    MuteLocalAudioCapture: function(bMute) {
        if (this.localstream && this.localstream.audioTracks && this.localstream.audioTracks.length) {
            this.localstream.audioTracks[0].enabled = (typeof (bMute) !== 'undefined') ? !bMute : false;
        }

        this.bUseMicrophone = !bMute;
    },

    IsPluginLoaded: function() {
        return this.bPluginLoadedSuccessfully;
    },

    PluginFailedToLoad: function() {
        this.log('PluginFailedToLoad: FAILED TO LOAD.');
    },

    InitGocastPlayer: function(jqSelector, success, failure) {
        if (!this.localplayer) {
            var k, settings = JSON.parse(window.localStorage.gcpsettings || '{}');

            // On successful init, we note that the plugin is successfully loaded.
            this.bPluginLoadedSuccessfully = true;
            // Now set our presence to 'av'='y'
            this.SendMyPresence();

            //
            // It is possible that we have already discovered other participants who are AV capable
            // and yet we have not initiated any call with them yet because our plugin got instantiated
            // late. If this happens, depending on who joined last in the room, a call would never
            // get created. To resolve this, we need to make a LateStartConnection() call for each
            // participant in the list.
            //
            for (k in this.participants) {
                if (this.participants.hasOwnProperty(k)) {
                    this.participants[k].LateStartConnection();
                }
            }

            if (!settings) {
                Callcast.SendLiveLog('Callcast.InitGocastPlayer: ' +
                                     'Occurence of defect #DE30');
                settings = {};
                delete window.localStorage.gcpsettings;
            }


            this.mediaHints = {audio: true, video: true};
            this.mediaHints = GoCastJS.Utils.joinObjects(this.mediaHints, settings);

            if (true === this.mediaHints.video) {
                if (!($(jqSelector).get(0).videoinopts[this.mediaHints.videoin])) {
                    if (this.mediaHints.videoin !== '') {
                        this.mediaHints.videoin = $(jqSelector).get(0).videoinopts['default'] || '';
                    }
                }

                // If we discover that we really don't have a video input device, then turn it off entirely.
                this.mediaHints.video = this.mediaHints.videoin !== '';
            }
            if (true === this.mediaHints.audio) {
                if (-1 === $(jqSelector).get(0).audioinopts.indexOf(this.mediaHints.audioin)) {
                    if (this.mediaHints.audioin !== '') {
                        this.mediaHints.audioin = $(jqSelector).get(0).audioinopts[0] || '';
                    }
                }

                // If we discover that we really don't have an audio input device, then turn it off entirely.
                this.mediaHints.audio = this.mediaHints.audioin !== '';

                if (-1 === $(jqSelector).get(0).audiooutopts.indexOf(this.mediaHints.audioout)) {
                    this.mediaHints.audioout = $(jqSelector).get(0).audiooutopts[0] || '';
                }
            }

            GoCastJS.getUserMedia(
                    new GoCastJS.UserMediaOptions(
                        this.mediaHints,
                        $(jqSelector).get(0)
                    ),
                    function(stream) {
                        Callcast.log('getUserMediaSuccess: ', stream.toString());
                        Callcast.localstream = stream;
                        Callcast.localplayer = $(jqSelector).get(0);

                        if (Callcast.localstream.videoTracks && 0 < Callcast.localstream.videoTracks.length) {
                            Callcast.SetVideoFilter(settings.effect || 'none');
                        }

                        if (!Callcast.localplayer && !Callcast.localplayer.version) {
                            alert('ERROR: Gocast Player object not found in DOM. Plugin problem?');
                        }
                        else
                        {
                            // Initialize local and show local video.
                            Callcast.MuteLocalVideoCapture();
                            Callcast.localplayer.width = 0;
                            Callcast.localplayer.height = 0;
                        }
//                      ongetusermediasuccess();
                        if (success) {
                            success();
                        }
                    },
                    function(message) {
                        Callcast.log('ERROR: getUserMediaFailure: ', message);
                        if (failure) {
                            failure(message);
                        }
                    }
                );
        }
    },

    DeInitGocastPlayer: function() {

        if (this.localplayer)
        {
            delete this.localplayer;
            this.localplayer = null;
        }
    },

    GetParticipantReport: function() {
        var rpt = '', k, cur, line;

        rpt = 'Participant Report: nickname, peer_connection, videoOn, retries/max\n';
        for (k in Callcast.participants) {
            if (Callcast.participants.hasOwnProperty(k)) {
                cur = Callcast.participants[k];
                line = k + ', pc=' + (cur.peer_connection ? 'y' : 'n') + ', video=' + (cur.videoOn ? 'on' : 'off') + cur.callRetries + '/' + cur.callRetryMax + '\n';
                rpt += line;
            }
        }

        return rpt;
    },

    Callee: function(nickin, room) {
        // Ojbect for participants in the call or being called (in progress)
        var nickname = nickin,
            self = this;

        this.peer_connection = null;
        this.stream = null;
        this.bIceStarted = false;

        // Nickname must be sure to NOT have spaces here.
        nickname = nickname.replace(/ /g, '');

        // The JID must stay original or messages won't get through.
        this.jid = room + '/' + nickin.replace(/ /g, '\\20');
        this.non_muc_jid = '';
        this.CallState = Callcast.CallStates.NONE;
        this.bAmCaller = null;

        this.callRetries = 0;       // Counter for # times we've tried making a p2p connection.
        this.callRetryMax = 16;     // Maximum # times a caller will give it a shot.

        // Store a list of ICE candidates for batch-processing.
        this.candidates = null;
        this.AddPluginResult = null;
        this.bHasAV = false;

        if (Callcast.Callback_AddSpotForParticipant) {
            Callcast.Callback_AddSpotForParticipant(nickname);
        }

        this.GetID = function() {
            if (this.AddPluginResult) {
                return this.AddPluginResult.id;
            }
            else {
                return -1;
            }
        };

        //
        // When a remote peer's stream has been added, I get called here.
        //
        this.onaddstream = function(stream) {
            if ('undefined' !== typeof(stream) && null !== stream) {
                Callcast.log('Callee:' + self.GetID() + ' onaddstream: added remote stream [' +
                            stream.label + ']');
                self.stream = stream;
            }
        };

        //
        // When a remote peer's stream gets removed, I get called here.
        //
        this.onremovestream = function(stream) {
            if ('undefined' !== typeof(stream) && null !== stream) {
                Callcast.log('Callee:' + self.GetID() + ' onremovestream: removed remote stream [' +
                            stream.label + ']');
                self.stream = null;
            }
        };

        this.onicecandidate = function(candidate, moreComing) {
            if (true === moreComing) {
                if ('string' === typeof(candidate) && null !== candidate) {
                    Callcast.log('Callee:' + self.GetID() + ' onicemessage: ', candidate);
                    // Send ICE message to the other peer.
                    var ice = $msg({to: self.jid, type: 'chat'})
                            .c('signaling', {xmlns: Callcast.NS_CALLCAST}).t(candidate);
                    Callcast.connection.send(ice);
                }
            }
        };

        this.onreadystatechange = function() {
            try {
                var state = self.peer_connection.ReadyState();

                Callcast.log('Callee:' + self.GetID() + ' OnReadyState: For ' + self.jid + ', Current=' + state);

                if (state === 'BLOCKED') {
                    // a blocked connection was detected by the C++ area.
                    // We need to reset the connection.

                    Callcast.log('Callee: ReadyState===BLOCKED - RESETTING PEER CONNECTION.');
                    self.ResetPeerConnection();

                    // If we've just given up on the connection, don't go further.
                    if (!this.peer_connection) {
                        return;
                    }
                }

                if (Callcast.Callback_ReadyState) {
                    Callcast.Callback_ReadyState(state, self.jid, self.jid.split('/')[1]);
                }
            }
            catch (e) {
                Callcast.log('Callee:' + self.GetID() + ' EXCEPTION: ', e.toString(), e);
            }
        };

        this.SetIAmCaller = function() {
            this.bAmCaller = true;
            Callcast.log('Callee:' + self.GetID() + ' I am the Caller.');
        };

        //
        // \brief If our plugin loads late - after discovering that others have AV capability, we need
        //          a way to get the connection started. This will only start a connection if the other
        //          side has been marked as AV capable (via having called StartConnection in the past)
        //
        this.LateStartConnection = function() {
            if (this.bHasAV && !this.peer_connection) {
                Callcast.log('Callee:' + self.GetID() + ' LATE START CONNECTION.');
                this.StartConnection();
            }
        };

        this.StartConnection = function() {
            // Only start the connection if:
            // a) peerconnection doesn't exist yet
            // b) We have AV available locally.
            this.bHasAV = true;

            //
            // Only call the plugin callback and init the peer connection if we have a functional AV plugin.
            //
            if (!this.peer_connection && Callcast.IsPluginLoaded()) {
                Callcast.log('Callee: Starting peerconnection and adding plugin to carousel for: ' + nickname);
                if (Callcast.Callback_AddPluginToParticipant) {
                    this.AddPluginResult = Callcast.Callback_AddPluginToParticipant(nickname);
                }
                else {
                    Callcast.log('Callee: ERROR: Init failure. No Callback_AddPluginToParticipant callback available.');
                }

                this.InitPeerConnection();

                if (this.bAmCaller) {
                    this.InitiateCall();
                }
            }
        };

        this.InitPeerConnection = function() {
            this.candidates = [];   // Start fresh with a new array.

            try {
                //
                // Now we need to construct the peer connection and setup our stream
                //

                if (this.peer_connection) {
                    this.peer_connection.Deinit();
                    this.peer_connection = null;
                }

                // Create a true PeerConnection object and attach it to the DOM.
                this.peer_connection = new GoCastJS.PeerConnection(
                        new GoCastJS.PeerConnectionOptions(
                            'STUN ' + Callcast.STUNSERVER + ':' + Callcast.STUNSERVERPORT,
                            this.onicecandidate, this.onaddstream,
                            this.onremovestream, this.onreadystatechange,
                            this.AddPluginResult));

                if (!this.peer_connection) {
                    alert('Callee:' + self.GetID() + " Gocast Remote Player object for name:'" + nickname + "' not found in DOM. Plugin problem?");
                }
                else
                {
                    // Add my stream to this peer connection in preparation
                    //
                    // Note: If we do not have a mic and we do not have video, then don't call AddStream!
                    if (Callcast.IsVideoDeviceAvailable() || Callcast.IsMicrophoneDeviceAvailable()) {
                        this.peer_connection.AddStream(Callcast.localstream);
                    }
                }
            } catch (e) {
                Callcast.log('Callee:' + self.GetID() + ' EXCEPTION: ', e.toString(), e);
            }
        };

        this.ResetPeerConnection = function() {
            var msg;

            try {
                if (this.peer_connection) {
                    // Every time we do a reset, we up the counter. This allows us to 'quit trying' at some point.
                    this.callRetries += 1;
                    if (this.callRetries > this.callRetryMax) {
                        msg = 'Callee:' + self.GetID() + ' ResetPeerConnection: P2P-DEFUNCT - Tried connecting to peer too many times.';
                        Callcast.log(msg);
                        Callcast.SendLiveLog('@' + Callcast.room.split('@')[0] + ': ' + msg);
                        this.peer_connection.SetDefunct();
                        return;
                    }

//                    Callcast.log('ResetPeerConnection: Resetting peer connection with: ' + this.jid);

                    this.InitPeerConnection();

                    if (this.bAmCaller) {
                        Callcast.log('Callee:' + self.GetID() + '  ResetPeerConnection - Re-establishing call to peer. Retry # ' + this.callRetries);
                        this.InitiateCall();
                    }
                    else {
                        Callcast.log('Callee:' + self.GetID() + '  ResetPeerConnection - Waiting on Caller to call me back... Retry # ' + this.callRetries);
                    }
                }
                else {
                    Callcast.log('Callee:' + self.GetID() + ' ResetPeerConnection: ERROR - peer_connection is already null.');
                }
            } catch (e) {
                Callcast.log('Callee:' + self.GetID() + ' EXCEPTION: ', e.toString(), e);
            }
        };

        this.InitiateCall = function() {
            var sdp,
                calltype, bVideo;

            this.bAmCaller = true;

            try {
                if (this.peer_connection)
                {
                    //
                    // Now that we're ready, bring the peer_connection online and kick it off.
                    //
                    calltype = ' - Audio Only.';
                    bVideo = Callcast.bUseVideo;

                    if (bVideo) {
                        calltype = ' - Audio+Video.';
                    }

                    Callcast.log('Callee:' + self.GetID() + ' Commencing to call ' + this.jid + calltype);

                    // Create with audio and video tracks in case they want to be used later.
                    sdp = this.peer_connection.CreateOffer({audio: true, video: true});

                    this.peer_connection.SetLocalDescription('OFFER', sdp, function() {
                        var offer = $msg({to: self.jid, type: 'chat'})
                                .c('offer', {xmlns: Callcast.NS_CALLCAST}).t(sdp);

                        // Now send our SDP/offer.
                        Callcast.connection.send(offer);
                    }, function(msg) {
                        Callcast.log('Callee:' + self.GetID() + ' InitiateCall: SetLocalDescription: FAIL: ' + msg);
                    });

                    // Oddball case where peer connection will wind up sending our video
                    // to the peer if they offer video and we don't.
                    if (Callcast.bUseVideo === false) {
                        Callcast.SendLocalVideoToPeers(Callcast.bUseVideo);
                    }
                }
                else {
                    Callcast.log('Callee:' + self.GetID() + ' Cannot InitiateCall - peer_connection is not initialized.');
                }
            }
            catch (e) {
                Callcast.log('Callee:' + self.GetID() + ' EXCEPTION: ', e.toString(), e);
            }
        };

        this.CompleteCall = function(offer) {
            var sdp, rs;

            this.bAmCaller = false;

            try {
                //
                // With the late-plugin-loaded scenarios, it is now possible that we receive a call offer
                // from the other side before we know if they are AV capable or not via their presence info.
                // The mere fact that they are calling us, however, implies that they have AV and they know
                // that we have AV also. So...if the peer connection is null here, initiate it and receive
                // the call.
                //
                if (!this.peer_connection) {
                    this.StartConnection();
                }

                if (this.peer_connection)
                {
                    rs = this.peer_connection.ReadyState();

                    if (rs === 'ACTIVE' || rs === 'CONNECTING'|| rs === 'CONNECTED')
                    {
                        Callcast.log('Callee:' + self.GetID() + ' CompleteCall: Offer received while active. RESET PEER CONNECTION.');
                        this.ResetPeerConnection();

                        // If we've just given up on the connection, don't go further.
                        if (!this.peer_connection) {
                            return;
                        }
                    }

                    Callcast.log('Callee:' + self.GetID() + ' Completing call...');
    //                Callcast.log('CompleteCall: Offer-SDP=' + offer);

                    this.peer_connection.SetRemoteDescription('OFFER', offer);

                    sdp = this.peer_connection.CreateAnswer(offer, {audio: true, video: true});
//                  Callcast.log('CompleteCall: Answer-SDP=' + sdp);
                    this.peer_connection.SetLocalDescription('ANSWER', sdp, function() {
                        Callcast.log('Callee:' + self.GetID() + ' CompleteCall: Success - setting local and starting ICE machine.');
                        self.peer_connection.StartIce();
                        self.bIceStarted = true;
                        var answer = $msg({to: self.jid, type: 'chat'})
                                .c('answer', {xmlns: Callcast.NS_CALLCAST}).t(sdp);

                        // Now send our SDP/answer.
                        Callcast.connection.send(answer);
                    }, function(msg) {
                        Callcast.log('Callee:' + self.GetID() + ' CompleteCall: SetLocalDescription: FAIL: ' + msg);
                    });

                    this.CallState = Callcast.CallStates.CONNECTED;
                }
                else {
                    Callcast.log('Callee:' + self.GetID() + ' Could not complete call. Peer_connection is not initialized.');
                }
            }
            catch (e) {
                Callcast.log('Callee:' + self.GetID() + ' EXCEPTION: ', e.toString(), e);
            }
        };

        this.InboundIce = function(candidate) {
            var i, len, rs;

            try {
                rs = this.peer_connection.ReadyState();

                if (this.peer_connection && (rs === 'ACTIVE' || rs === 'CONNECTING' || rs === 'CONNECTED'))
                {
                    if (this.bIceStarted) {
                        Callcast.log('Callee:' + self.GetID() + ' InboundIce: Got Candidate - ' + candidate);

                        // Process change: process the most recent candidate,
                        // and then iterate through the .candidates array
                        // processing each of them in turn as well.
                        this.peer_connection.ProcessIceMessage(candidate);

                        // NOTE: If re-processing seems to cause a problem, it
                        // can be defeated by simply deleting or commenting out
                        // the for() loop below or setting 'len = 0;'
/*                        len = this.candidates.length;
                        for (i = 0 ; i < len ; i += 1)
                        {
                            Callcast.log('  Re-processing prior candadate # ' + i);
                            this.peer_connection.ProcessIceMessage(this.candidates[i]);
                        }
*/
                        // Now add the current one to the array.
                        this.candidates.push(candidate);
                    }
                    else {
                        Callcast.log('Callee:' + self.GetID() + ' WARNING: Ice machine not started yet but received an inbound Ice Candidate.');
                    }
                }
                else {
                    if (!this.peer_connection) {
                        Callcast.log('Callee:' + self.GetID() + ' Could not process ICE message. Peer_connection is invalid.');
                    }
                    else {
                        Callcast.log('Callee:' + self.GetID() + ' Could not process ICE message. Peer_connection state not ACTIVE. Currently === ' +
                                this.peer_connection.ReadyState());
                    }
                }
            }
            catch (e) {
                Callcast.log('Callee:' + self.GetID() + ' EXCEPTION: ', e.toString(), e);
            }
        };

        this.InboundAnswer = function(sdp) {
            try {
                if (this.peer_connection)
                {
                    Callcast.log('Callee:' + self.GetID() + '  InboundAnswer: Setting SetRemoteDescription as ANSWER');
                    this.peer_connection.SetRemoteDescription('ANSWER', sdp);
                    self.peer_connection.StartIce();
                    self.bIceStarted = true;
                }
                else {
                    Callcast.log('Callee:' + self.GetID() + ' Could not process answer message. Peer_connection is invalid.');
                }
            }
            catch (e) {
                Callcast.log('Callee:' + self.GetID() + ' EXCEPTION: ', e.toString(), e);
            }
        };

        this.RemoveSpotAndPlugin = function() {
            // Now remove object from div
            var nick = Strophe.getResourceFromJid(this.jid);
            // Make sure it has no spaces...
            if (nick) {
                nick = nick.replace(/ /g, '');
            }

            // This will remove the plugin if present and the spot both.
            if (Callcast.Callback_RemoveSpotForParticipant) {
                Callcast.Callback_RemoveSpotForParticipant(nick);
            }
            else {
                alert('Callee:' + self.GetID() + ' ERROR: RemoveSpotAndPlugin: Callcast.setCallbackForRemoveSpotForParticipant() has not been called yet.');
            }
        };

        this.DropCall = function() {
            if (this.peer_connection)
            {
                Callcast.log('Callee:' + self.GetID() + ' Dropping call for ' + this.jid);
                this.peer_connection.Deinit();
                this.peer_connection = null;
            }

            this.RemoveSpotAndPlugin();
        };

    },

    escapeit: function(msg) {
        return msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    log: function() {
        // Need to prepend the date to the first argument.
        arguments[0] = GoCastJS.logDate() + arguments[0] + ' ';

        if (logQ) {
            logQ.log.apply(logQ, arguments);
        }

        console.log.apply(console, arguments);
    },

    PluginLogCallback: function(entries) {
        var i, len;

        len = entries.length;

        for (i = 0; i < len; i += 1)
        {
            Callcast.log('# PLUGIN # ' + entries[i]);
        }
    },

    accepted: function(iq) {
        Callcast.log('Got an accepted call.');
    },

    rejected: function(iq) {
        Callcast.log('Call was rejected.');
    },

    initCallError: function(iq) {
        Callcast.log('Initiating call resulted in an error.');
    },

    ///
    /// Grab the room list from the server, and put it in an array of .roomlist[jid] = roomname
    /// Then trigger 'roomlist_updated' for the UI portion to react.
    ///
    RefreshRooms: function() {
        if (Callcast.connection && Callcast.connection.connection) {
            Callcast.connection.connection.muc.listRooms(Callcast.CALLCAST_ROOMS, function(thelist) {
                Callcast.roomlist = {};    // Remove all entries from the rooms list.

                $(thelist).find('item').each(function() {
                    Callcast.roomlist[$(this).attr('jid')] = $(this).attr('name');
                });

                $(document).trigger('roomlist_updated');
            });
        }
        else {
            Callcast.log('ERROR: No connection/connection/muc for listRooms()');
        }
    },

    CallMsgHandler: function(msg) {
        var res_nick = Strophe.getResourceFromJid($(msg).attr('from')),
            sdp, invite, from, roomjid, password, reason;

        if (res_nick) {
            res_nick = res_nick.replace(/\\20/g, ' ');
        }


        // Inbound call - initiating
        if ($(msg).find('offer').length > 0)
        {
            Callcast.log('Got inbound call-offer from ' + $(msg).attr('from'));

            if (!Callcast.participants[res_nick])
            {
                Callcast.log('ERROR: Participant for nick=' + res_nick + ' not found. Who is this guy?');
                return true;
            }

            //
            // Otherwise, we already know this guy - so complete the call.
            //
            sdp = $(msg).children('offer').text().replace(/&quot;/g, '"');

            Callcast.participants[res_nick].CompleteCall(sdp);
        }
        else if ($(msg).find('answer').length > 0)
        {
            Callcast.log('Got inbound answer from ' + $(msg).attr('from'));

            if (!Callcast.participants[res_nick])
            {
                Callcast.log('ERROR: Participant for nick=' + res_nick + ' not found. Who is this guy?');
                return true;
            }

            //
            // Otherwise, we already know this guy - so complete the call.
            //
            sdp = $(msg).children('answer').text().replace(/&quot;/g, '"');

            Callcast.participants[res_nick].InboundAnswer(sdp);
        }
        else if ($(msg).find('signaling').length > 0)
        {
            Callcast.log('Got inbound signaling-message from ' + $(msg).attr('from'));

            sdp = $(msg).children('signaling').text().replace(/&quot;/g, '"');

            if (Callcast.participants[res_nick]) {
                Callcast.participants[res_nick].InboundIce(sdp);
            }
            else {
                Callcast.log("Error with inbound signaling. Didn't know this person: " + res_nick);
            }
        }
        else if ($(msg).find('cmd').length > 0)
        {
            Callcast.process_multi_command(msg);
        }
        else if ($(msg).find('x').length > 0)
        {
            Callcast.log('Got inbound INVITATION to join a session.');
            invite = $(msg).find('x');
            from = $(msg).attr('from');
            roomjid = $(invite).attr('jid');
            password = $(invite).attr('password');
            reason = $(invite).attr('reason');

            // Put up an approval dialog and work from there to join or not join the call.

            $('#approval_dialog').append('<p>Ring Ring: Call from ' + Strophe.getBareJidFromJid(from) + '. Ring Ring...</p>');
            if (reason) {
                $('#approval_dialog').append('<p>' + reason + '</p>');
            }

            $('#approval_dialog').dialog({
                autoOpen: true,
                draggable: false,
                modal: true,
                title: 'Incoming Call From ' + Strophe.getBareJidFromJid(from),
                buttons: {
                    'Answer': function() {
                        Callcast.JoinSession(Strophe.getNodeFromJid(roomjid), roomjid);
                        $(this).dialog('close');
                    },
                    'Ignore': function() {
                        $(this).dialog('close');
                        alert('Incoming call request was ignored.');
                    }
                }
            });


        }

        return true;
    },

    SendGroupCmd: function(cmd, attribs_in) {
        var attribs_out = attribs_in,
            msgToSend;

        attribs_out.cmdtype = cmd;
        attribs_out.xmlns = Callcast.NS_CALLCAST;

        msgToSend = $msg({to: this.room, type: 'groupchat', xmlns: Callcast.NS_CALLCAST})
                .c('cmd', attribs_out);

        this.log('Group Command: ', msgToSend.toString());

        this.connection.send(msgToSend);
    },

    SendPrivateCmd: function(to, cmd, attribs_in) {
        var attribs_out = attribs_in,
            msgToSend;

        attribs_out.cmdtype = cmd;
        attribs_out.xmlns = Callcast.NS_CALLCAST;

        msgToSend = $msg({to: to, type: 'chat', xmlns: Callcast.NS_CALLCAST})
                .c('cmd', attribs_out);

        this.log('Private Command: ', msgToSend.toString());

        this.connection.send(msgToSend);
    },

    SendSyncLink: function(txt) {
        this.SendGroupCmd('synclink', {link: txt});
    },

    SendSpotInfo: function(info) {
        this.SendGroupCmd('spotinfo', info);
    },

    //
    // Send to all other users a URL, altText, and ID. They should take that information
    // and render the URL to an image and use that image as the display image for that carousel spot.
    //
    SendURLToRender: function(info) {
        this.SendGroupCmd('urlrenderinfo', info);
    },

    SetFBSignedRequestAndAccessToken: function(fbsr, access) {

    // Only set/change and send presence if something has changed.
        if (!this.fb_sent_pres || this.fbsr !== fbsr || this.fbaccesstoken !== access)
        {
            this.fbsr = fbsr;
            this.fbaccesstoken = access;

            this.SendFBPres();
        }
    },

    SendFBPres: function() {
        var pres;

        // Now that we're connected, let's send our presence info to the switchboard and FB info.
        // Note - we're going to send our INTRO_SR buried in our presence.
        //        This way, the switchboard will know who we are on facebook when our presence is seen.

        // Only send this if there is a fbsr -- they logged in as a facebook user.
        if (this.fbsr !== '')
        {
            pres = $pres({to: this.SWITCHBOARD_FB, intro_sr: this.fbsr, intro_at: this.fbaccesstoken})
                .c('x', {xmlns: 'http://jabber.org/protocol/muc'});

            this.fb_sent_pres = true;
            this.connection.send(pres);
        }
    },

    SendAdHocPres: function() {
        var pres;

        // Now that we're connected, let's send our presence info to the switchboard
        pres = $pres({to: this.SWITCHBOARD_FB, adhocname: this.nick})
            .c('x', {xmlns: 'http://jabber.org/protocol/muc'});

        this.connection.send(pres);
    },

    //
    // Stanza can be a single <message ><cmd > or <message><cmd ><cmd ><cmd >... at this stage.
    //
    process_multi_command: function(message) {
        var ret = true, info,
            cmdtype, newmsg,
            len, i, items;

        items = $(message).children('cmd');
        len = items.length;

        if (len) {
            // Setup our new message 'header/parent'
            newmsg = $(message).clone();

            for (i = 0 ; i < len ; i += 1)
            {
                info = {};

                // Snatch out all the attributes from the 'cmd' child.
                $(items[i]).each(function() {
                    $.each(this.attributes, function(i, attrib) {
                        info[attrib.name] = attrib.value;
                    });
                });

//                Callcast.log('Processing cmd: ', items[i]);
//                Callcast.log('info is: ', info);
                cmdtype = $(items[i]).attr('cmdtype');

                // Lop off all the children that may be present (originals or ones from the prior iteration)
                $(newmsg).children('cmd').remove();
                // Now we need to add the current 'items[i]' into the mix as a child.
                $(newmsg).append(items[i]);

//                Callcast.log('Newly constituted message: ', newmsg);

                switch (cmdtype)
                {
                case 'synclink':
                    ret = Callcast.on_sync_link(newmsg);
                    break;
                case 'spotinfo':
                    ret = Callcast.on_spot_info(newmsg);
                    break;
                case 'urlrenderinfo':
                    ret = Callcast.on_url_render(newmsg);
                    break;
                case 'addspot':
//                    Callcast.log('addspot: Received object: ', info);
                    if (Callcast.Callback_AddSpot) {
                        Callcast.Callback_AddSpot(info);
                    }
                    ret = true;
                    break;
                case 'removespot':
                    if (Callcast.Callback_RemoveSpot) {
                        Callcast.Callback_RemoveSpot(info);
                    }
                    ret = true;
                    break;
                case 'setspot':
//                    Callcast.log('setspot: Received object: ', info);
                    if (Callcast.Callback_SetSpot) {
                        Callcast.Callback_SetSpot(info);
                    }
                    ret = true;
                    break;
                default:
                    Callcast.log('ERROR: Ignoring unknown inbound cmd: ' + cmdtype);
                    break;
                }

                if (!ret) {
                    Callcast.log('process_multi_command: ERROR: failed processing cmd.');
                    return false;
                }
            }
        }
        else {
            Callcast.log('Did not find cmd children in message. Ignoring.');
        }

        return ret;
    },

    on_callcast_groupchat_command: function(message) {
        var ret;

        Callcast.log('Groupchat command received: ', message);

        ret = Callcast.process_multi_command(message);
        if (!ret) {
            Callcast.log('on_callcast_groupchat_command: ERROR: failed processing cmd.');
            return false;
        }

        return ret;
    },

    on_url_render: function(message) {
        var info = {};

        $(message).find('cmd').each(function() {
            $.each(this.attributes, function(i, attrib) {
                info[attrib.name] = attrib.value;
            });
        });
//          info = { id: $(cmd).attr('id'), altText: $(cmd).attr('altText'), url: $(cmd).attr('url') };

        this.log('Received URL to render from: ' + $(message).attr('from').split('/')[1]);

        this.setCarouselContent(info);

        return true;
    },

    on_spot_info: function(message) {
        var info = {};

        $(message).find('cmd').each(function() {
            $.each(this.attributes, function(i, attrib) {
                info[attrib.name] = attrib.value;
            });
        });
//          info = { id: $(cmd).attr('id'), image: $(cmd).attr('image'),
//                  altText: $(cmd).attr('altText'), url: $(cmd).attr('url') };

        this.log('Received spot info from: ' + $(message).attr('from').split('/')[1]);

        this.setCarouselContent(info);

        return true;
    },

    on_sync_link: function(message) {
        var from = $(message).attr('from'),
            room = Strophe.getBareJidFromJid(from),
            nick = Strophe.getResourceFromJid(from),
            delayed;

        if (nick) {
            nick = nick.replace(/\\20/g, ' ');
        }

        delayed = $(message).children('delay').length > 0 ||
            $(message).children("x[xmlns='jabber:x:delay']").length > 0;

        if (delayed) {
            this.log('Ignoring delayed sync link:' + $(message).children('body').text());
        }

        if (room === Callcast.room && !delayed)
        {
            if (nick === Callcast.nick) {
                return true;
            }

            $(document).trigger('synclink', $(message).children('cmd').attr('link'));
        }

        return true;
    },

    SendPublicChat: function(msg) {
        var chat = $msg({to: this.room, type: 'groupchat'}).c('body').t(msg);
        this.connection.send(chat);
    },

    SendPrivateChat: function(msg, to) {
        var chat = $msg({to: this.room + '/' + to.replace(/ /g, '\\20'), type: 'chat'}).c('body').t(msg);
        this.connection.send(chat);
    },

    SendDirectPrivateChat: function(msg, to) {
        var chat = $msg({to: to, type: 'chat'}).c('body').t(msg);
        this.connection.send(chat);
    },

    SendLiveLog: function(msg) {
        this.SendDirectPrivateChat('LIVELOG ; ' + this.nick + ' ; ' + decodeURI(msg).replace(';','|'), this.ROOMMANAGER);
        this.connection.flush();    // This is important to get to the server right away - it's a live log.
    },

    SendLogsToLogCatcher: function(cbSuccess, cbFailure, cbProgress) {
        var self = this, ibb, datagetfn;

        if (!this.connection.connection) {
            Callcast.log('Cannot send logs. Connection is not valid currently.');
            cbFailure('Cannot send logs. Connection is not valid currently.');
            return;
        }

        datagetfn = function(max) {
            var buf = logQ.removeLinesWithMaxBytes(max);
            if (!buf || buf === '') {
                return null;
            }
            else {
                return buf;
            }
        };

        ibb = new GoCastJS.IBBTransferClient({ connection: this.connection,
                                               room: this.room.split('@')[0],
                                               nick: this.nick,
                                               receiver: this.LOGCATCHER,
                                               fileSize: logQ.getSize(),
                                               cbDataGet: datagetfn,
                                               cbLog: Callcast.log },
        function(msg) {
            self.log('SUCCESSFUL LogCatcher send. msg: ' + msg);
            if (cbSuccess) {
                cbSuccess(msg);
            }
        }, function(errmsg) {
            self.log('ERROR: Failed LogCatcher send. msg: ' + msg);
            if (cbFailure) {
                cbFailure(msg);
            }
        }, function(name, sent, total) {
            if (cbProgress) {
                cbProgress(name, sent, total);
            }
        });
    },

    SendFeedback: function(msg) {
        this.connection.send($msg({to: this.FEEDBACK_BOT, nick: this.nick, room: this.room.split('@')[0]}).c('body').t(msg));
    },

    on_public_message: function(message) {
        var xmlns = $(message).attr('xmlns'),
            from = $(message).attr('from'),
            room = Strophe.getBareJidFromJid(from),
            nick = Strophe.getResourceFromJid(from),
            notice, nick_class, body, delayed, msginfo;

        if (nick) {
            nick = nick.replace(/\\20/g, ' ');
        }

        // make sure message is from the right place
        if (room === Callcast.room && xmlns !== Callcast.NS_CALLCAST) {
            // is message from a user or the room itself?
            notice = !nick;

            // messages from ourself will be styled differently
            nick_class = 'nick';
            if (nick === Callcast.nick) {
                nick_class += ' self';
            }

            body = $(message).children('body').text();

            delayed = $(message).children('delay').length > 0 ||
                $(message).children("x[xmlns='jabber:x:delay']").length > 0;

            // look for room topic change
//            var subject = $(message).children('subject').text();
//            if (subject) {
//                $('#room-topic').text(subject);
//            }

            // Always give the room manager a sane name.
            if (nick === Strophe.getResourceFromJid(this.overseer)) {
                nick = 'Room Manager';
            }

            msginfo = { nick: nick, nick_class: nick_class, body: body, delayed: delayed, notice: notice };

            // Don't send out an update for a non-existent body message.
            // This is what will happen when a signaling/spotinfo message comes in.
            if (body) {
                $(document).trigger('public-message', msginfo);
            }

        }

        return true;
    },

    on_private_message: function(message) {
        var xmlns = $(message).attr('xmlns'),
            from = $(message).attr('from'),
            room = Strophe.getBareJidFromJid(from),
            nick = Strophe.getResourceFromJid(from),
            body, msginfo;

        if (nick) {
            nick = nick.replace(/\\20/g, ' ');
        }

        // make sure message is from the right place
        if (room === Callcast.room && xmlns !== Callcast.NS_CALLCAST) {
            body = $(message).children('body').text();

            if (!body) {
                return true;    // Empty body - likely a signalling message.
            }

            msginfo = { nick: nick, body: body };

            $(document).trigger('private-message', msginfo);
        }

        return true;
    },

    MsgHandler: function(msg) {
//      Callcast.log("STANDARD MESSAGE:");
//      Callcast.log(msg);
        return true;
    },

    PresHandler: function(presence) {
            var from = $(presence).attr('from'),
                room = Strophe.getBareJidFromJid(from),
                info, nick, user_jid, tmproom;

            if ($(presence).attr('usertype') === 'silent')    // Overseer/serverBot
            {
                // Let's grab the name of the overseer for future reference...
                Callcast.overseer = from;
                return true;
            }

            Callcast.log('From-NICK: ' + $(presence).attr('from'));

            // make sure this presence is for the right room
            if (room === Callcast.room) {
                nick = Strophe.getResourceFromJid(from);
                if (nick) {
                    nick = nick.replace(/\\20/g, ' ');
                }

                // Marking presence of video or lack of video if other side has noted it.
                if (Callcast.participants[nick])
                {
                    if ($(presence).attr('video'))
                    {
                        Callcast.participants[nick].videoOn = $(presence).attr('video') === 'on';
                    }
                    else {
                        Callcast.participants[nick].videoOn = null;
                    }

                    if ($(presence).attr('av')) {
                        Callcast.log('PRES-INFO: Already-known-Nick: ' + nick + ' has AV capability (plugin)');
                        // Other side has av. Make sure we have a peerconnection with them.
                        Callcast.participants[nick].StartConnection();  // Will drop out if connection already present.
                    }
                    else {
                        Callcast.log('PRES-INFO: Already-known-Nick: ' + nick + ' has NO AV capability (NO-plugin)');
                    }

                    // Update the presence information.
                    info = {};
                    if ($(presence).children('info')[0])
                    {
                        info.url = $(presence).children('info').attr('url');
                        info.id = $(presence).children('info').attr('id');
                        info.image = $(presence).children('info').attr('image');
                        info.altText = $(presence).children('info').attr('altText');
                    }

                    info.nick = nick;
                    info.hasVid = Callcast.participants[nick].videoOn && Callcast.IsPluginLoaded();

                    $(document).trigger('user_updated', info);
                }
                else if (nick === Callcast.nick && $(presence).attr('video'))
                {
                    // Update the presence information.
                    info = {};
                    if ($(presence).children('info')[0])
                    {
                        info.url = $(presence).children('info').attr('url');
                        info.id = $(presence).children('info').attr('id');
                        info.image = $(presence).children('info').attr('image');
                        info.altText = $(presence).children('info').attr('altText');
                    }

                    info.nick = nick;
                    info.hasVid = Callcast.bUseVideo;

                    $(document).trigger('user_updated', info);
                }

                if ($(presence).attr('type') === 'error' && !Callcast.joined) {
                    // error joining room; reset app
                    if ($(presence).find('not-allowed').length > 0) {
                        $(document).trigger('room-creation-not-allowed', Strophe.getNodeFromJid(room));
                    }
                    else if ($(presence).find('conflict').length > 0) {
                        Callcast.HandleNicknameConflict(room, nick);  // Likely 2nd time through here and a failure.
                        return false;   // Kill handler.
                    }
                    else {
                        Callcast.log('PresHandler: Error joining room. Disconnecting.');
                    }

                    Callcast.disconnect('presence-error');
                }
                else if (nick === Callcast.nick && $(presence).attr('type') === 'unavailable')
                {
                    // We got kicked out
                    // So leave and come back?
        // RMW: This was never really the right thing - we're already by definition 'gone'            Callcast.LeaveSession(null, 'Found-myself-unavailable');
                    $(document).trigger('left_session');
//                    alert('We got kicked out of the session for some reason.');
                }
                else if (!Callcast.participants[nick] && $(presence).attr('type') !== 'unavailable') {
                    // add to participant list
                    // Make sure we ONLY add **OTHERS** to the participants list.
                    // Otherwise we'll wind up calling ourselves.
                    user_jid = $(presence).find('item').attr('jid');

                    //
                    // No matter what, we need to add this participant to the room/call.
                    // (Except when the new participant is ourselves. :-)
                    //
                    if (nick !== Callcast.nick)
                    {
                        Callcast.participants[nick] = new Callcast.Callee(nick, room);
                        if (user_jid) {
                            Callcast.participants[nick].non_muc_jid = user_jid;
                        }

                        // Now, if we are new to the session (not fully joined ye) then it's our job to call everyone.
                        if (!Callcast.joined) {
                            Callcast.participants[nick].SetIAmCaller();
                        }

                        if ($(presence).attr('av')) {
                            Callcast.log('PRES-INFO: New-Nick: ' + nick + ' has AV capability (plugin)');
                            // They have AV -- so start up peerconnection and plugin. (so long as we have the plugin too)
                            Callcast.participants[nick].StartConnection();
                        }
                        else {
                            Callcast.log('PRES-INFO: New-Nick: ' + nick + ' has NO AV capability (NO-plugin)');
                        }
                    }

                    // Check to see if video-on/off is specified.
                    if (nick !== Callcast.nick)
                    {
                        // If info blob is embedded in presence, then capture it.
                        if ($(presence).children('info')) {
                            Callcast.participants[nick].info = $(presence).children('info');
                        }

                        if ($(presence).attr('video'))
                        {
                            Callcast.participants[nick].videoOn = $(presence).attr('video') === 'on';
                        }
                        else {
                            Callcast.participants[nick].videoOn = null;
                        }
                    }

                    //
                    // Inform the UI that we have a new user
                    //
                    // Have an odd case where we get re-informed that WE are in the room.
                    // So, if we are already 'joined' and we see ourselves, then don't add to list.
                    //
                    if (!Callcast.joined || (nick !== Callcast.nick))
                    {
                        info = {};
                        if ($(presence).children('info')[0])
                        {
                            info.url = $(presence).children('info').attr('url');
                            info.id = $(presence).children('info').attr('id');
                            info.image = $(presence).children('info').attr('image');
                            info.altText = $(presence).children('info').attr('altText');
                        }

                        info.nick = nick;

                        if (nick !== Callcast.nick) {
                            info.hasVid = Callcast.participants[nick].videoOn && Callcast.IsPluginLoaded();
                        }
                        else {
                            info.hasVid = Callcast.bUseVideo;
                        }

                        $(document).trigger('user_joined', info);
                    }

                    //
                    // Handle our own join in the room which completes the session-join.
                    //
                    if (!Callcast.joined && nick === Callcast.nick)
                    {
                        if (!Callcast.overseer) {
                            // If we don't know the overseer yet, then we have tripped back into
                            // this room on a re-attach where the xmpp server didn't notice that we
                            // were gone. But we were...so we need all the participants to identify
                            // themselves again. The only way to be clean here is to Leave and re-join.
                            Callcast.log('WARNING: Quick-re-attach bug. Must EXIT and RE-JOIN.');
                            tmproom = Callcast.room;
                            Callcast.LeaveSession(function() {
                                Callcast.log('WARNING: Quick-re-attach bug. RE-JOINING now to: ' + tmproom);
                                Callcast.JoinSession(tmproom.split('@')[0], tmproom);
                            }, 'Quick-re-attach bug');
                            return true;  // TODO:RMW - may want to return false here to kill the handler if someone else is going to take care of re-adding.
                        }

                        Callcast.log('INFO: At time of receiving all participants (joined=true) ...');
                        Callcast.log('  INFO: pluginLoaded=' + Callcast.IsPluginLoaded());
                        // Dump all room participants to the log in case we run into issues of 'noav' vs 'av' issues.
                        Callcast.log('  INFO: ' + Callcast.GetParticipantReport());

                        Callcast.joined = true;
                        Callcast.SendMyPresence();
                        $(Callcast).trigger('my_join_complete', nick);
                    }

                } else if (Callcast.participants[nick] && $(presence).attr('type') === 'unavailable') {

                    Callcast.log("Caller '" + nick + "' has dropped. Destroying connection.");
                    Callcast.participants[nick].DropCall();
                    delete Callcast.participants[nick];

                    $(document).trigger('user_left', nick);
                }

                if ($(presence).attr('type') !== 'error' &&
                    !Callcast.joined) {
                    // check for status 110 to see if it's our own presence
                    if ($(presence).find("status[code='110']").length > 0) {
                        // check if server changed our nick
                        if ($(presence).find("status[code='210']").length > 0) {
                            Callcast.nick = Strophe.getResourceFromJid(from);
                            if (Callcast.nick) {
                                Callcast.nick = Callcast.nick.replace(/\\20/g, ' ');
                            }
                        }

                        // room join complete
                        $(document).trigger('joined_session');
                    }
                }
            }

            return true;
        },

    //
    // \brief Rather than sending all strokes to make the complete whiteboard each time, with this feature
    //      we send single strokes to the server which then echos those out to the group.
    //
    // \param obj A JSON object which must have at least two properties:
    //      a) obj.stroke - This is the item which will be echoed by the server to other participants.
    //      b) obj.spotnumber - This is required to know which spot we are referring to.
    //
    // \param cb A callback which is called upon success with a null/empty argument cb();. On failure, this
    //      callback is called with an error string such as cb("Error sending stroke");
    //
    SendSingleStroke: function(obj, cb) {
        var myOverseer = this.overseer,
            self = this,
            tosend = obj;

        if (!obj.stroke || !obj.spotnumber) {
            if (cb) {
                cb('SendSingleStroke: ERROR. Bad object passed.');
            }

            this.log('SendSingleStroke: ERROR. Bad object passed.');
            return false;
        }

        tosend.spottype = 'whiteBoard';
        tosend.xmlns = this.NS_CALLCAST;
        tosend.from = this.nick;

        if (!myOverseer) {
            console.error('ERROR: No overseer.');
        }
        //
        this.connection.sendIQ($iq({
            to: myOverseer,
            id: 'sendstroke1',
            type: 'set'
          }).c('wb_stroke', tosend),

        // Successful callback...
          function(iq) {
              if (cb) {
                cb();
              }

              return true;
          },

        // Failure callback
          function(iq) {
              self.log('Error sending stroke', iq);
              if (cb) {
                cb('Error sending stroke');
              }
          }
        );
    },

    //
    // \brief Function allows clients to request a new spot be added to everyone's carousel.
    //      This IQ is sent to the server and when successful, the server will respond by
    //      first sending a groupchat to the room with a '<cmd cmdtype='addspot' spotnumber='value' ..../>
    //      And upon success the IQ is responded to with a 'result'.
    //
    // \param obj A generic JSON object the sender can use to communicate spot info to the other clients.
    //      The server does not count on any particular items in this object. \note It does add a property
    //      of obj.spotnumber which allows the server to dictate the spot numbers for new entries to ensure
    //      no spotnumber collisions in a given mucRoom. Also, note that the amount of data in obj should be
    //      kept to a minimum for both network conservation as well as database storage reasons. This obj is
    //      stored in the NoSQL DynamoDB 'as is' for each and every spot.
    //
    // \param cb A callback which is called upon success with a null/empty argument cb();. On failure, this
    //      callback is called with an error string such as cb("Error adding spot");
    //
    AddSpot: function(obj, cb) {
        var myOverseer = this.overseer,
            self = this,
            tosend = obj;

        tosend.xmlns = this.NS_CALLCAST;
        tosend.from = this.nick;

        if (!myOverseer) {
            console.error('ERROR: No overseer.');
        }
        //
        this.connection.sendIQ($iq({
            to: myOverseer,
            id: 'addspot1',
            type: 'set'
          }).c('addspot', tosend),

        // Successful callback...
          function(iq) {
              if (cb) {
                cb();
              }

              return true;
          },

        // Failure callback
          function(iq) {
              self.log('Error adding spot', iq);
              if (cb) {
                cb('Error adding spot');
              }
          }
        );
    },

    //
    // \brief Function allows clients to request the deletion of a spot on everyone's carousel.
    //      This IQ is sent to the server and when successful, the server will respond by
    //      first sending a groupchat to the room with a '<cmd cmdtype='removespot' spotnumber='value' ..../>
    //      And upon success the IQ is responded to with a 'result'.
    //
    // \param obj A generic JSON object the sender can use to communicate spot info to the other clients.
    //      The server does not count on any particular items in this object aside from spotnumber. The
    //      spotnumber property is used to ensure this spot actually exists. If it does, it will be removed
    //      at the server and in the external database. If it does not exist, an error callback is given and
    //      no broadcast of this deletion will occur.
    //
    // \param cb A callback which is called upon success with a null/empty argument cb();. On failure, this
    //      callback is called with an error string such as cb("Error removing spot");
    //
    RemoveSpot: function(obj, cb) {
        var myOverseer = this.overseer,
            self = this,
            tosend = obj;

        tosend.xmlns = this.NS_CALLCAST;
        tosend.from = this.nick;

        if (!myOverseer) {
            console.error('ERROR: No overseer.');
        }
        //
        this.connection.sendIQ($iq({
            to: myOverseer,
            id: 'removespot1',
            type: 'set'
          }).c('removespot', tosend),

        // Successful callback...
          function(iq) {
              if (cb) {
                cb();
              }

              return true;
          },

        // Failure callback
          function(iq) {
              self.log('Error removing spot', iq);
              if (cb) {
                cb('Error removing spot');
              }
          }
        );
    },

    //
    // \brief Function allows clients to change info for an existing spot on everyone's carousel.
    //      This IQ is sent to the server and when successful, the server will respond by
    //      first sending a groupchat to the room with a '<cmd cmdtype='setspot' spotnumber='value' ..../>
    //      And upon success the IQ is responded to with a 'result'.
    //
    // \param obj A generic JSON object the sender can use to communicate spot info to the other clients.
    //      The server does not count on any particular items in this object aside from spotnumber. The
    //      spotnumber property is used to ensure this spot actually exists. If it does, it will be modified
    //      at the server and in the external database. If it does not exist, an error callback is given and
    //      no broadcast of this change will occur.
    //
    // \param cb A callback which is called upon success with a null/empty argument cb();. On failure, this
    //      callback is called with an error string such as cb("Error setting spot");
    //
    SetSpot: function(obj, cb) {
        var myOverseer = this.overseer,
            self = this,
            tosend = obj;

        tosend.xmlns = this.NS_CALLCAST;
        tosend.from = this.nick;

        if (!obj.spotnumber) {
            if (cb) {
                cb('Missing obj property spotnumber.');
            }

            return false;
        }

        if (!myOverseer) {
            console.error('ERROR: No overseer.');
        }
        //
        this.connection.sendIQ($iq({
            to: myOverseer,
            id: 'setspot1',
            type: 'set'
          }).c('setspot', tosend),

        // Successful callback...
          function(iq) {
              if (cb) {
                cb();
              }

              return true;
          },

        // Failure callback
          function(iq) {
              self.log('Error setting spot', iq);
              if (cb) {
                cb('Error setting spot');
              }
          }
        );
    },

//
// Ask the server to create 'roomname' and then we can join it.
// If 'roomname' is "", then we're asking the server to create a random unique
// room name and when the 'ok' comes back, there will be an attribute of 'name' which
// will be the newly created random/unique room name.
//
    CreateUnlistedAndJoin: function(roomname, cb, cbError) {
        var roommanager = this.ROOMMANAGER,
            self = this, attrs;

        Callcast.log('CreateUnlistedAndJoin: Creating name: ' + roomname);
        if (!this.connection) {
            Callcast.log('CreateUnlistedAndJoin: ERROR - no connection found.');
        }

        attrs = {
            xmlns: this.NS_CALLCAST,
            name: roomname.toLowerCase()
        };

        // If the user has specified a maximum number of participants on the URL/command-line
        // then we need to put it in the formulation to be sent up.
        if ($.getUrlVar('maxparticipants')) {
            attrs.maxparticipants = $.getUrlVar('maxparticipants');
        }

        //
        this.connection.sendIQ($iq({
            to: roommanager,
            id: 'roomcreate1',
            type: 'set' }).c('room', attrs),

        // Successful callback...
            function(iq) {
                if ($(iq).find('ok')) {
                    // Change of protocol here - we will ALWAYS listen to what name is given
                    // by the server as our request for a room may turn out to be a room
                    // which is 'full' and so we get an overflow name instead which is
                    // the room we're supposed to join.

                    console.log('DEBUG: roomcreate1 success. Local roomname: ' + roomname);
                    console.log('DEBUG:    and IQ is: ', iq);

                    if (roomname === '') {
                        // Asked to create a random room - must retrieve name...
                        roomname = $(iq).find('ok').attr('name');
                    }
                    else {
                        // We check to see if we've been given a different room name. (overflow)
                        if (roomname !== $(iq).find('ok').attr('name')) {
                            // Overflow - we know which to join. All good.
                            //     But we should change the URL in the address bar.
                            // As it turns out, the caller of this (handleRoomSetup) will
                            // wind up doing all the right things if we simply set the actual
                            // given roomname now. Hurray!

                            roomname = $(iq).find('ok').attr('name');
                        }
                    }

                    self.JoinSession(roomname, roomname + self.AT_CALLCAST_ROOMS);

                    if (cb) {
                        cb(roomname);
                    }
                }

                return true;
            },

            // Failure callback
            function(iq) {
                Callcast.log('Error creating room', iq);

                if (cbError) {
                    cbError(iq);
                }
            }, 5000);
    },

    //
    // \brief Grabs any old jids in the current sessionObject and passes them to the roommanager
    //          along with the room in question and the nickname desired via IQ.
    //          If the server knows of any of the 'old jids', it will kick out the nickname from
    //          the specified room.
    // \param roomname - bare room name - without @domain
    // \param nick - nickname with no spaces
    //
    RequestNickSubstitution: function(in_roomname, in_nick, cbSuccess, cbFailure) {
        var roommanager = this.ROOMMANAGER,
            self = this,
            oldjids, ojo,
            roomname, nick;

        roomname = in_roomname.split('@')[0].toLowerCase();
        nick = this.NoSpaces(in_nick);

        ojo = this.GetOldJids();
        if (!ojo) {
            // There are no old jids. This is a failure case.
            if (cbFailure) {
                cbFailure('No old jids available. Cannot ask for substitution.');
                return;
            }
        }
        else {
            oldjids = JSON.stringify(ojo);

            //
            this.connection.sendIQ($iq({
                to: roommanager,
                id: 'substitution1',
                type: 'set'
              }).c('subjidfornickname', {xmlns: this.NS_CALLCAST, room: roomname,
                                    nick: nick, oldjids: oldjids}),

            // Successful callback...
              function(iq) {
                  self.JoinSession(roomname, roomname + self.AT_CALLCAST_ROOMS);

                  if (cbSuccess) {
                    cbSuccess();
                  }

                  return true;
              },

            // Failure callback
              function(iq) {
                  Callcast.log('Error substituting new jid for nickname:' + nick, iq);
                  if (cbFailure) {
                    cbFailure('Error substituting at server side.');
                  }
              }
            , 3000);    // 3 seconds for the server to respond...
        }
    },

    //
    // TODO: roomname seems to be unused and show be removed - will effect all current users of the function.
    //
    JoinSession: function(roomname, roomjid) {
        Callcast.room = roomjid.toLowerCase();
        Callcast.roomjid = roomjid.toLowerCase();

        // We need to ensure we have a nickname. If one is not set, use the JID username
        if (!Callcast.nick || Callcast.nick === '') {
            Callcast.nick = Strophe.getNodeFromJid(this.connection.getJid());
        }

        Callcast.joined = false;

        Callcast.DropAllParticipants();

         if (roomname === '' || roomjid === '')
         {
             alert('Room and RoomJid must be given to join a session.');
             return false;
         }

         if (Callcast.joined)
         {
             alert('Already in a session. Must leave session first.');
             return false;
         }

        if (this.connection.connection) {
            this.connection.connection.muc.join(roomjid, Callcast.nick, Callcast.MsgHandler, Callcast.PresHandler);
        }
        else {
            Callcast.log('ERROR: No connection/connection/muc for join()');
        }

         Callcast.SendLiveLog('@' + roomname.split('@')[0] + ':, Login-Complete-Joining JID: ' + Callcast.connection.getJid().split('@')[0] + ', - userAgent: ' + navigator.userAgent.replace(/;/g, '|'));

         Callcast.SendLocalVideoToPeers(Callcast.bUseVideo);

         $(document).trigger('joined_session');

        // Handle all webrtc-based chat messages within a MUC room session
        // Also to handle all INVITATIONS to join a session which are sent directly to the jid and not within the MUC
// Already registered globally on connect        Callcast.connection.addHandler(Callcast.CallMsgHandler, Callcast.NS_CALLCAST, "message", "chat");
        return true;
    },

    LeaveSession: function(cb, reason) {
        var finishUp, isDone = false,
            leaveTimer = null,
            self = this;

        Callcast.log('LeaveSession: REASON: ', reason);

        if (Callcast.room === null || Callcast.room === '')
        {
//          alert("Not currently in a session.");
            return;
        }

        finishUp = function() {
            // Due to Chrome async/ajax issues, we flush on all 'leave' requests.
            self.connection.flush();
            self.DropAllParticipants();

            Callcast.joined = false;
            Callcast.room = '';
            Callcast.roomjid = '';

    //TODO:RMW - BUG - this sending of video to peers is silly after a muc.leave() above unless we're really quick.
//            self.SendLocalVideoToPeers(self.bUseVideo);

            Callcast.log('LeaveSession: triggering left_session. Reason: ', reason);
            $(document).trigger('left_session');
        };

        this.WriteUpdatedState();
        if (this.connection.connection) {
            leaveTimer = setTimeout(function() {
                if (!isDone) {
                    Callcast.log('LeaveSession: Using TIMEOUT to finishUp and callback. Reason: ', reason);
                    isDone = true;

                    finishUp();

                    if (cb) {
                        cb();
                    }
                }
            }, 750);

            this.connection.connection.muc.leave(Callcast.room, Callcast.nick, function() {
                // Cancel the timer above.
                clearTimeout(leaveTimer);

                if (!isDone) {
                    Callcast.log('LeaveSession: Using muc.leave callback to finishUp and callback. Reason: ', reason);
                    isDone = true;

                    finishUp();

                    if (cb) {
                        cb();
                    }
                }
            });
        }
        else {
            finishUp();

            if (cb) {
                cb();
            }

            Callcast.log('ERROR: No connection/connection/muc for leave(). Reason: ', reason);
        }
    },

    MakeCall: function(to_whom, room, reason)
    {
      var invite, no_answer, isAnswered;
        // Ensure we plug this in as lower-case to avoid troubles when recognizing against presence information coming back.
     room = room.toLowerCase();

     if (!to_whom) {
         alert("'Call-To' is missing. Must give a full JID/resource to call to.");
     }
     else
     {
         Callcast.JoinSession(room, room + Callcast.AT_CALLCAST_ROOMS);

         // Now we need to wait until we've actually joined prior to sending the invite.

         $(Callcast).bind('my_join_complete', function(event) {
             Callcast.connection.sendIQ($iq({to: room + Callcast.AT_CALLCAST_ROOMS, type: 'set'}).c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'}).c('x', {xmlns: 'jabber:x:data', type: 'submit'}),
                function() {
                     // IQ received without error.
                     Callcast.RefreshRooms();

                     // Formulate an invitation to
                     invite = $msg({from: Callcast.connection.getJid(), to: to_whom, type: 'chat'})
                                    .c('x', {xmlns: Callcast.NS_CALLCAST, jid: room + Callcast.AT_CALLCAST_ROOMS, reason: reason});
                     Callcast.connection.send(invite);

                        //  Wait for "x" seconds of timeout - if no one else in the room, then we quit the room. No answer.
                     no_answer = setTimeout(function() {
                            // No one answered.

                             // Our "ringing/calling" dialog should be closed if we timeout.
                             $('#calling_dialog').dialog('close');
                             alert('No Answer.');
                     }, Callcast.NOANSWER_TIMEOUT_MS);

                     // Now open up the "calling" dialog box until the timer goes off or the user hits 'hangup'
                    $('#calling_dialog').append('<p>Ringing other party...</p>');

                    isAnswered = false;
                    $('#calling_dialog').dialog({
                        autoOpen: true,
                        draggable: false,
                        modal: true,
                        closeOnEscape: false,
                        open: function() {
                            // If someone joins the session while we're calling, then we have an answer - hurray.
                            $(document).bind('user_joined', function(event) {
                                // TODO really need to enusre the 'user_joined' is the person invited and not just another person joining at the same time.
                                clearTimeout(no_answer);
                                $(this).unbind();

                                // This time - close the dialog but we're successful!
                                isAnswered = true;
                                $('#calling_dialog').dialog('close');   // Closing because we're on the call.
                            });
                        },
                        close: function() {
                            if (isAnswered) {
                                return;
                            }

                            // Cancel the timer for the ringing / hangup / destroy
                             clearTimeout(no_answer);

                             Callcast.LeaveSession();
                        },
                        title: 'Calling ' + to_whom,
                        buttons: {
                            'End Call': function() {
//                              alert("Hung up.");
                                // TODO - drop from call - leave room and possibly destroy room if no one else is in it. Right action?
                                // Currently we're just closing the dialog which will in turn have us leave the room.
                                $('#calling_dialog').dialog('close');
                            }
                        }
                    });

             },
             function() {
                 // IQ error. Room config must not have worked??
                 alert('Session configuration error. Config-save possibly failed.');
             });

             $(this).unbind(event);
         });

     }

    },

    SessionStorageClear: function() {
        var pers;

        if (typeof (Storage) !== 'undefined') {
            pers = sessionStorage.getItem('persist');  // Save all things here and below...

            sessionStorage.clear();

            sessionStorage.setItem('persist', pers);  // And put it all back.
        }
    },

    ClearOldJids: function() {
        var persist;

        if (typeof (Storage) !== 'undefined') {
            persist = localStorage.getItem('persist');

            if (persist) {
                persist = JSON.parse(persist);  // Turn it into an object.

                // Now clear the old jids object.
                delete persist.oldjids;

                // Then re-stringify and store it.
                localStorage.setItem('persist', JSON.stringify(persist));
            }
        }
    },

    RememberCurrentJid: function() {
        var ojids,
            newlen, persist;

        if (!this.connection.getJid() || !this.connection.getJid().split('@')[1]) {
            this.log('RememberCurrentJid: No valid jid.');
        }

        if (this.connection.getJid() && typeof (Storage) !== 'undefined') {
            persist = localStorage.getItem('persist');

            if (persist) {
                persist = JSON.parse(persist);  // Turn it into an object.
                ojids = persist.oldjids || [];
            }
            else {
                persist = {};
                ojids = [];
            }

            if (ojids.length === 0 || ojids[0] !== this.connection.getJid()) {
                // We have a different jid than is at the top [0] of the array.
                newlen = ojids.unshift(this.connection.getJid());

                // Store a max of 5 entries
                if (newlen > 5) {
                    ojids.pop();   // remove the oldest one.
                }
            }

            // Now re-write out the final array regardless of change or initialization.
            persist.oldjids = ojids;
            localStorage.setItem('persist', JSON.stringify(persist));
        }
    },

    GetOldJids: function() {
        var oj;
        if (typeof (Storage) !== 'undefined') {
            oj = localStorage.getItem('persist');
            return oj ? JSON.parse(oj).oldjids : null;
        }

        return null;
    },

    disconnect: function(reason) {
        var sendReason = reason || 'In diconnect() no reason.';

        this.DropAllParticipants();
        this.MuteLocalAudioCapture(false);

        this.LeaveSession(null, 'disconnect()');

        //
        //TODO:RMW - maybe there is a parameter to disconnect - where item-not-found drives forgetting
        //           all rid/jid/sid info but other disconnects do not?
        //
        // Zero it out. The conneciton is no longer valid.
        if (typeof (Storage) !== 'undefined') {
            this.SessionStorageClear();
        }

        this.connection.setSync();
        this.connection.flush();
        this.connection.disconnect(sendReason);   // This will eventually trigger TERMINATED.
        this.connection.flush();

        this.joined = false;
        this.room = '';
        this.nick = '';

        //$(document).trigger('disconnected');
    },


    ///
    /// connect using this JID and password -- and optionally use this URL for the BOSH connection.
    ///
    /// opts { jid: , password: }
    ///   OR { username: , password: }
    ///   OR null/{} for anonymous
    ///
    connect: function(opts, url) {
        var self = this,
            boshurl = url || '/xmpp-httpbind';

        if (!this.connection)
        {
            // TODO:RMW - rather than pause/reset/nullify and then re-new a new Strophe connection
            //            we should just reset the connection and re-login with connect.
            this.connection = new GoCastJS.StropheConnection({ boshurl: boshurl,
                                                               xmppserver: Callcast.CALLCAST_XMPPSERVER,
                                                               statusCallback: this.connStatusHandler,
                                                               logFn: Callcast.log});
        }

        if (!opts && this.connection.hasSavedLoginInfo()) {
            this.connection.autoConnect();
        }
        else {
            this.connection.connect(opts);
        }
    },

    leaveIfReEntry: function(cb, reason) {
        // Determine if we're in a 'refresh' situation and if so, then re-attach.
        if (typeof (Storage) !== 'undefined' && sessionStorage.room)
        {
            // We need to force a LeaveSession and setup video state too.
            Callcast.room = sessionStorage.room;
            Callcast.nick = sessionStorage.nick;

            if (sessionStorage.bUseVideo === 'true' || sessionStorage.bUseVideo === 'false') {
                Callcast.bUseVideo = sessionStorage.bUseVideo;
            }

            if (sessionStorage.bUseMicrophone === 'true' || sessionStorage.bUseMicrophone === 'false') {
                Callcast.bUseMicrophone = sessionStorage.bUseMicrophone;
            }

            Callcast.log('ATTACHED/CONNECTED - Leaving Session.');
            // Leave the current room and re-join
            Callcast.LeaveSession(cb, reason);
        }
        else {
            Callcast.log('ATTACHED/CONNECTED - NO Storage or No sessionStorage.room - joining?');
            if (cb) {
                cb();
            }
        }
    },

    connStatusHandler: function(status) {
        switch(status) {
            case Strophe.Status.CONNECTED:
                this.log('XMPP/Strophe Finalizing connection and then triggering connected...');
                Callcast.leaveIfReEntry(function() {
                    Callcast.finalizeConnect();
                    Callcast.Callback_ConnectionStatus('Connected');
                    $(document).trigger('connected');
                }, 'connected');
                break;
            case Strophe.Status.DISCONNECTED:
                this.log('XMPP/Strophe Disconnected. Likely re-trying though.');
                Callcast.Callback_ConnectionStatus('Disconnected');
                break;
            case Strophe.Status.TERMINATED:
                this.log('XMPP/Strophe Terminated.');
                $(document).trigger('disconnected');
                Callcast.Callback_ConnectionStatus('Terminated');
                break;
            case Strophe.Status.AUTHENTICATING:
                this.log('XMPP/Strophe Authenticating...');
                Callcast.Callback_ConnectionStatus('Authenticating');
                break;
            case Strophe.Status.CONNECTING:
                this.log('XMPP/Strophe Connecting...');
                Callcast.Callback_ConnectionStatus('Connecting');
                break;
            case Strophe.Status.ATTACHED:
                this.log('XMPP/Strophe Re-Attach of connection successful.');
                Callcast.leaveIfReEntry(function() {
                    Callcast.log('ATTACHED - LeaveSession is complete. Re-join now.');
                    Callcast.finalizeConnect();
                    $(document).trigger('connected');
                    Callcast.Callback_ConnectionStatus('Re-Attached');
                }, 'attached');
                break;
            case Strophe.Status.DISCONNECTING:
                this.log('XMPP/Strophe is Dis-Connecting...');
                Callcast.RememberCurrentJid();
                Callcast.Callback_ConnectionStatus('Disconnecting');
                break;
            case Strophe.Status.CONNFAIL:
                this.log('XMPP/Strophe reported connection failure...it should re-attach...');
                Callcast.RememberCurrentJid();
                Callcast.Callback_ConnectionStatus('Connection failed');
                break;
            case Strophe.Status.AUTHFAIL:
                Callcast.RememberCurrentJid();
                Callcast.disconnect('AuthFail');
                Callcast.Callback_ConnectionStatus('Bad username or password');
                break;
            default:
                this.log('XMPP/Strophe connection callback - unhandled status = ' + status);
                Callcast.Callback_ConnectionStatus('Unknown status');
                break;
        }
    },

    finalizeConnect: function() {
        // RMW odd error where room creation iq is seen by the server but unable to be sent back.
        // Could be because our presence is not 'felt' yet. This can be related to the re-attach.
        this.connection.send($pres());
        this.connection.flush();
        this.connection.send($pres());
        this.connection.flush();

        if (this.fbsr && this.fbsr !== '') {
            this.SendFBPres();
        }

        /* this.connection.debugXML(true); */

        // Handle inbound signaling messages
        //Callcast.connection.addHandler(Callcast.handle_webrtc_message, null, "message", "webrtc-message");

        // handle all INVITATIONS to join a session which are sent directly to the jid and not within the MUC
        this.connection.addHandler(this.CallMsgHandler.bind(this), Callcast.NS_CALLCAST, 'message', 'chat');

        // handle all SYNC_LINKS and custom commands within the MUC
        this.connection.addHandler(this.on_callcast_groupchat_command.bind(this), Callcast.NS_CALLCAST, 'message', 'groupchat');

        // handle all GROUP CHATS within the MUC
        this.connection.addHandler(this.on_public_message.bind(this), null, 'message', 'groupchat');

        // handle all PRIVATE CHATS within the MUC
        this.connection.addHandler(this.on_private_message.bind(this), null, 'message', 'chat');

        // handle any inbound error stanzas (for now) via an alert message.
        this.connection.addHandler(this.onErrorStanza.bind(this), null, null, 'error');

        // Kick things off by refreshing the rooms list.
        this.RefreshRooms();

    }
 };

GoCastJS.SendLogsXMPP = function(room, nick, logcatcher, id, pw, cbSuccess, cbFailure, url) {
    // Make an XMPP login completely from scratch and then send the logs.
    this.jid = id;
    this.pw = pw;
    this.connection = null;
    this.boshconn = url || '/xmpp-httpbind';

    this.room = room;
    this.nick = nick;
    this.LOGCATCHER = logcatcher;

    this.cbSuccess = cbSuccess;
    this.cbFailure = cbFailure;

    this.connection = new Strophe.Connection(this.boshconn);

    if (!this.connection) {
        throw 'ERROR: Strophe connection could not be instantiated.';
    }

    this.connection.reset();

    /* Want to enable debugging of XML?
    this.connection.debugXML();
    */

    this.connection.connect(this.jid, this.pw, this.genConnHandler());
};

GoCastJS.SendLogsXMPP.prototype.genConnHandler = function() {
    var self = this;
    return function(status, err) { self.connHandler(status, err); };
};

GoCastJS.SendLogsXMPP.prototype.connHandler = function(status, err) {
    var self = this;
    if (err) {
        Callcast.log('SendLogsXMPP: Error connecting - status: ' + status + ', Error given was: ' + err);
    }
    else {
//        console.log('SendLogsXMPP: STATUS=' + status);

        switch(status) {
            case Strophe.Status.CONNECTED:
                Callcast.log('SendLogsXMPP: Connected. Setting up connection particulars.');

                this.connection.addHandler(this.handle_ping.bind(this), 'urn:xmpp:ping', 'iq', 'get');
                this.connection.addHandler(this.onErrorStanza.bind(this), null, null, 'error');

                this.connection.send($pres());
                this.connection.flush();

                console.log('Now making call to send logs...');

                this.SendLogsToLogCatcher(function(msg) {
                    self.connection.disconnect();
                    Callcast.log('SendLogsXMPP: Successfully sent logs.');
                    if (self.cbSuccess) {
                        self.cbSuccess();
                    }
                }, function(errmsg) {
                    self.connection.disconnect();
                    Callcast.log('SendLogsXMPP: CONNECTED BUT FAILED TO SEND LOGS. Err: ' + errmsg);
                    if (self.cbFailure) {
                        self.cbFailure(errmsg);
                    }
                });
                break;
            case Strophe.Status.DISCONNECTED:
                this.connection = null;
                break;
            case Strophe.Status.AUTHENTICATING:
            case Strophe.Status.CONNECTING:
            case Strophe.Status.ATTACHED:
            case Strophe.Status.DISCONNECTING:
            case Strophe.Status.CONNFAIL:
            case Strophe.Status.AUTHFAIL:
                break;
            default:
                Callcast.log('SendLogsXMPP: WARNING: Unknown status: ' + status);
                break;
        }
    }
};

GoCastJS.SendLogsXMPP.prototype.handle_ping = function(iq) {
    var pong = $iq({to: $(iq).attr('from'), id: $(iq).attr('id'), type: 'result'});
    console.log('SendLogsXMPP - ping/pong');
    this.connection.send(pong);
    return true;
};

GoCastJS.SendLogsXMPP.prototype.onErrorStanza = function(err) {
//    alert('Unknown Error Stanza: ' + $(err).getChild('error').text());
    console.log($(err));
    return true;
};

GoCastJS.SendLogsXMPP.prototype.SendLogsToLogCatcher = function(cbSuccess, cbFailure, cbProgress) {
    var self = this, ibb,
        datagetfn;

    datagetfn = function(max) {
        var buf = logQ.removeLinesWithMaxBytes(max);
        if (!buf || buf === '') {
            return null;
        }
        else {
            return buf;
        }
    };

    ibb = new GoCastJS.IBBTransferClient({connection: this.connection,
                                          room: this.room.split('@')[0],
                                          nick: this.nick,
                                          receiver: this.LOGCATCHER,
                                          fileSize: logQ.getSize(),
                                          cbDataGet: datagetfn,
                                          cbLog: Callcast.log },
       function(msg) {
        Callcast.log('SUCCESSFUL LogCatcher send. msg: ' + msg);
        if (cbSuccess) {
            cbSuccess(msg);
        }
    }, function(errmsg) {
        Callcast.log('ERROR: Failed LogCatcher send. msg: ' + msg);
        if (cbFailure) {
            cbFailure(msg);
        }
    }, function(name, sent, total) {
        if (cbProgress) {
            cbProgress(name, sent, total);
        }
    });
};

GoCastJS.SendFileToFileCatcher = function(connection, room, filecatcher) {
    this.connection = connection;

    this.room = room.split('@')[0];
    this.FILECATCHER = filecatcher;
};

GoCastJS.SendFileToFileCatcher.prototype.SendFile = function(file, data, cbSuccess, cbFailure, cbProgress) {
    var self = this, ibb,
        datagetfn,
        offset = 0,
        totalLen = data.length;

    //
    // data - this is where the binary data for the file is located.
    //        Dole it out in slices not to exceed 'max'
    //
    datagetfn = function(max) {
        var remaining = totalLen - offset,
            toSendLen = remaining >= max ? max : remaining,
            toRet;

        if (toSendLen) {
            // Need to return a buffer here for sending a 'chunk'
            toRet = data.slice(offset, offset + toSendLen);
            offset += toSendLen;
            return toRet;
        }
        else {
            return null;
        }
    };

    ibb = new GoCastJS.IBBTransferClient({connection: this.connection,
                                          room: this.room.split('@')[0],
                                          filename: file,
                                          fileSize: totalLen,
                                          receiver: this.FILECATCHER,
                                          cbDataGet: datagetfn,
                                          cbLog: Callcast.log },
       function(msg, iq) {
        Callcast.log('SUCCESSFUL FileCatcher send. msg: ' + msg);
        if (cbSuccess) {
            cbSuccess(msg, iq);
        }
    }, function(errmsg) {
        Callcast.log('ERROR: Failed FileCatcher send. msg: ' + msg);
        if (cbFailure) {
            cbFailure(msg);
        }
    }, function(name, sent, total) {
        if (cbProgress) {
            cbProgress(name, sent, total);
        }
    });
};

//
//Grab the url arguments and process/parse them into an array.
//
//Thanks to http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html for this.
//
$.extend({
getUrlVars: function() {
 var vars = [], hash, i,
     hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
 for (i = 0; i < hashes.length; i += 1)
 {
   hash = hashes[i].split('=');
   vars.push(hash[0]);
   vars[hash[0]] = hash[1];
 }
 return vars;
},
getUrlVar: function(name) {
 return $.getUrlVars()[name];
}
});
