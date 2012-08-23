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

/*jslint sloppy: false, todo: true, browser: true, devel: true */
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

GoCastJS.BQueue.prototype.log = function(msg) {
    var stats = '';

    if (typeof msg !== 'string') {
        return false;
    }

    stats = 'log: pre:' + this.length + ', in:' + msg.length + ', post-nodrop:' + (this.length+msg.length);

    this.q.push(msg);
    this.length += msg.length;

    // Drop the head of the Queue until we are 'in spec' on total length.
    while(this.length > this.maxLength && this.q.length) {
        this.q.shift();
    }

    stats += ', post-drop:' + this.length;
    console.log('DEBUG: ' + stats);

    // If we had to delete every entry just to get below the threshold, that's an error.
    if (!this.q.length) {
        return false;
    }

    return true;
};

//
// Returns bytes out of the logs up to max # bytes.
// Only returns integral line items however.
// Returns null if no lines available.
//
GoCastJS.BQueue.prototype.getLinesWithMaxBytes = function(max) {
    var out = '',
        removed = 0;

    if (!this.q.length) {
        console.log('DEBUG: BQueue::getLinesWithMaxBytes: Empty Queue');
        return null;
    }

    while (this.q.length && out.length + this.q[0].length <= max)
    {
        this.length -= this.q[0].length;
        out += this.q.shift();
        removed += 1;
    }

    console.log('DEBUG: BQueue::getLinesWithMaxBytes: Removed ' + removed + ' lines. Returned ' + out.length + ' bytes.');
    return out;
};

var Callcast = {
    PLUGIN_VERSION_CURRENT: 0.0,
    PLUGIN_VERSION_REQUIRED: 0.0,
    PLUGIN_VERSION_CURRENT_MAC: 1.27,
    PLUGIN_VERSION_REQUIRED_MAC: 1.26,
    PLUGIN_VERSION_CURRENT_WIN: 1.27,
    PLUGIN_VERSION_REQUIRED_WIN: 1.26,
    PLUGIN_VERSION_CURRENT_LINUX: 1.21,
    PLUGIN_VERSION_REQUIRED_LINUX: 1.21,
    PLUGIN_DOWNLOAD_URL: 'http://video.gocast.it/plugin.html',
    NOANSWER_TIMEOUT_MS: 6000,
    CALLCAST_XMPPSERVER: 'video.gocast.it',
    CALLCAST_ROOMS: 'gocastconference.video.gocast.it',
    AT_CALLCAST_ROOMS: '@gocastconference.video.gocast.it',
    NS_CALLCAST: 'urn:xmpp:callcast',
//    STUNSERVER: 'stun.l.google.com',
    STUNSERVER: 'video.gocast.it',
    FEEDBACK_BOT: 'feedback_bot_etzchayim@video.gocast.it',
    STUNSERVERPORT: 19302,
    ROOMMANAGER: 'overseer@video.gocast.it/roommanager',
    SWITCHBOARD_FB: 'switchboard_gocastfriends@video.gocast.it',
    Callback_AddSpot: null,
    Callback_RemoveSpot: null,
    Callback_SetSpot: null,
    Callback_AddPlugin: null,
    Callback_RemovePlugin: null,
    Callback_AddCarouselContent: null,
    Callback_RemoveCarouselContent: null,
    Callback_ReadyState: null,
    Callback_ConnectionStatus: null,
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
    WIDTH: 256,
    HEIGHT: 192,
    overseer: null,
    presenceBlob: null,
    fbsr: '',
    fbaccesstoken: '',
    fb_sent_pres: false,
    sessionInfo: {},

    WriteUpdatedState: function() {
        if (typeof (Storage) !== 'undefined')
        {
            // If the connection is alive, store info.
            // If it's not alive, then there's nothing to do here.
            //
            // Due to odd bug found, we'll also check to ensure the jid is a full jid with something before/after the '@' sign.
            //
            if (this.connection && this.connection.authenticated && this.connection.connected && this.connection.jid.split('@')[1])
            {
                sessionStorage.setItem('jid', this.connection.jid);
                sessionStorage.setItem('rid', this.connection.rid);
                sessionStorage.setItem('sid', this.connection.sid);

                sessionStorage.setItem('room', this.room);
                sessionStorage.setItem('nick', this.nick);
                sessionStorage.setItem('bUseVideo', this.bUseVideo);
            }
            else
            {
                // Zero it out. The conneciton is not valid.
                sessionStorage.clear();
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

    setCallbackForAddPlugin: function(cb) {
        this.Callback_AddPlugin = cb;
    },

    setCallbackForRemovePlugin: function(cb) {
        this.Callback_RemovePlugin = cb;
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
            console.log('INFO: Recipient ' + nick + ' became unavailable.');
        }
        else if ($(err).find('conflict').length > 0)
        {
            alert("The nickname '" + nick + "' is already in use.\nPlease choose a different nickname.");
            this.disconnect();
        }
        else if ($(err).find('service-unavailable').length > 0)
        {
            alert('Could not enter room. Likely max # users reached in this room.');
            this.LeaveSession();
        }
//        else if ($(err).find('not-allowed').length > 0)
//        {
          // Handled inside PresHandler             $(document).trigger('room-creation-not-allowed', room);
//        }
        else if ($(err).find('registration-required').length > 0)
        {
            alert('Room is currently locked. You may attempt to KNOCK to request entry.');
            this.LeaveSession();
        }
        else if ($(err).find('forbidden').length > 0)
        {
            alert('Someone in the room has blocked your admission.\nKnocking is being ignored as well.');
            this.LeaveSession();
        }
        else
        {
            alert('Unknown Error Stanza: ' + $(err).children('error').text());
            console.log($(err));
        }

        return true;
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
            else if (navigator.appVersion.indexOf('Linux') !== -1)
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
    // info is JSON formatted. Expectation is:
    //  info.nick - nickname to modify size of.
    //  info.hasVid - if this variable is used/present, set video to this.(WIDTH,HEIGHT), else if false, set to 0,0
    //  info.width - if this is present AND info.height is present, set width,height to these values.
    //
    ShowRemoteVideo: function(info) {
        var nick = info.nick;
        nick = this.WithSpaces(nick);

        if (nick && this.participants[nick] && this.participants[nick].peer_connection)
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
        else if (nick !== this.nick) {
            console.log('ShowRemoteVideo: nickname not found: ' + nick);
        }

        // If we're just missing the peer_connection, let's note an error.
        if (nick && this.participants[nick] && !this.participants[nick].peer_connection) {
            console.log('ShowRemoteVideo: ERROR - peer_connection is null.');
        }
    },

    SendLocalVideoToPeers: function(send_it) {
        // This is used to detect a change in video on/off condition later in the function.
        var old_bUseVideo = this.bUseVideo;

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
//          console.log("DEBUG: Pre-StopLocalVideo() inside SendLocalVideoToPeers");
                this.MuteLocalVideoCapture();
//          console.log("DEBUG: Post-StopLocalVideo() inside SendLocalVideoToPeers");
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
        var pres;
        if (this.bUseVideo === true) {
            pres = $pres({to: this.roomjid + '/' + this.NoSpaces(this.nick), video: 'on'}).c('x', {xmlns: 'http://jabber.org/protocol/muc'});
        }
        else if (this.bUseVideo === false) {
            pres = $pres({to: this.roomjid + '/' + this.NoSpaces(this.nick), video: 'off'}).c('x', {xmlns: 'http://jabber.org/protocol/muc'});
        }
        else {
            pres = $pres({to: this.roomjid + '/' + this.NoSpaces(this.nick)}).c('x', {xmlns: 'http://jabber.org/protocol/muc'});
        }

        if (this.presenceBlob) {
            pres.up().c('info', this.presenceBlob);
        }

        console.log('SendMyPresence: ', pres.toString());
        this.connection.send(pres);
    },

    ToggleLocalVideoCapture: function() {
        if (this.localstream) {
            this.localstream.videoTracks[0].enabled = !(this.localstream.videoTracks[0].enabled);
        }
    },

    MuteLocalVideoCapture: function(bMute) {
        if (this.localstream) {
            this.localstream.videoTracks[0].enabled = (typeof (bMute) !== 'undefined') ? !bMute : false;
        }
    },

    MuteLocalAudioCapture: function(bMute) {
        if (this.localstream) {
            this.localstream.audioTracks[0].enabled = (typeof (bMute) !== 'undefined') ? !bMute : false;
        }
    },

    InitGocastPlayer: function(jqSelector, success, failure) {
        if (!this.localplayer) {
            GoCastJS.getUserMedia(
                    new GoCastJS.UserMediaOptions(
                        {audio: true, video: true},
                        $(jqSelector).get(0)
                    ),
                    function(stream) {
                        console.log('getUserMediaSuccess: ', stream);
                        Callcast.localstream = stream;
                        Callcast.localplayer = $(jqSelector).get(0);
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

        // Store a list of ICE candidates for batch-processing.
        this.candidates = null;

        // Need to call InitPeerConnection -- calling it at the bottom of this constructor.

        //
        // When a remote peer's stream has been added, I get called here.
        //
        this.onaddstream = function(stream) {
            if ('undefined' !== typeof(stream) && null !== stream) {
                console.log('onaddstream: added remote stream [' +
                            stream.label + ']');
                self.stream = stream;
            }
        };

        //
        // When a remote peer's stream gets removed, I get called here.
        //
        this.onremovestream = function(stream) {
            if ('undefined' !== typeof(stream) && null !== stream) {
                console.log('onremovestream: removed remote stream [' +
                            stream.label + ']');
                self.stream = null;
            }
        };

        this.onicecandidate = function(candidate, moreComing) {
            if (true === moreComing) {
                if ('string' === typeof(candidate) && null !== candidate) {
                    console.log('onicemessage: ', candidate);
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

                console.log('OnReadyState: For ' + self.jid + ', Current=' + state);

                if (state === 'BLOCKED') {
                    // a blocked connection was detected by the C++ area.
                    // We need to reset the connection.

                    console.log('Callee: ReadyState===BLOCKED - RESET PEER CONNECTION.');
                    self.ResetPeerConnection();
                }

                if (Callcast.Callback_ReadyState) {
                    Callcast.Callback_ReadyState(state, self.jid, self.jid.split('/')[1]);
                }
            }
            catch (e) {
                console.log('EXCEPTION: ', e.toString(), e);
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
                    alert("Gocast Remote Player object for name:'" + nickname + "' not found in DOM. Plugin problem?");
                }
                else
                {
                    // Add my stream to this peer connection in preparation
                    this.peer_connection.AddStream(Callcast.localstream);
                }
            } catch (e) {
                console.log('EXCEPTION: ', e.toString(), e);
            }
        };

        this.ResetPeerConnection = function() {
            try {
                if (this.peer_connection) {
                    console.log('ResetPeerConnection: Resetting peer connection with: ' + this.jid);

                    this.InitPeerConnection();

                    if (this.bAmCaller) {
                        console.log('  ResetPeerConnection - Re-establishing call to peer.');
                        this.InitiateCall();
                    }
                    else {
                        console.log('  ResetPeerConnection - Waiting on Caller to call me back...');
                    }
                }
                else {
                    console.log('ResetPeerConnection: ERROR - peer_connection is already null.');
                }
            } catch (e) {
                console.log('EXCEPTION: ', e.toString(), e);
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

                    console.log('Commencing to call ' + this.jid + calltype);

                    // Create with audio and video tracks in case they want to be used later.
                    sdp = this.peer_connection.CreateOffer({audio: true, video: true});

                    console.log('  InitiateCall: Setting SetLocalDescription as OFFER');
                    this.peer_connection.SetLocalDescription('OFFER', sdp, function() {
                        var offer = $msg({to: self.jid, type: 'chat'})
                                .c('offer', {xmlns: Callcast.NS_CALLCAST}).t(sdp);

                        // Now send our SDP/offer.
                        Callcast.connection.send(offer);
                    }, function(msg) {
                        console.log('InitiateCall: SetLocalDescription: FAIL: ' + msg);
                    });

                    // Oddball case where peer connection will wind up sending our video
                    // to the peer if they offer video and we don't.
                    if (Callcast.bUseVideo === false) {
                        Callcast.SendLocalVideoToPeers(Callcast.bUseVideo);
                    }
                }
                else {
                    console.log('Cannot InitiateCall - peer_connection is invalid.');
                }
            }
            catch (e) {
                console.log('EXCEPTION: ', e.toString(), e);
            }
        };

        this.CompleteCall = function(offer) {
            var sdp;

            this.bAmCaller = false;

            try {
                if (this.peer_connection)
                {
                    if (this.peer_connection.ReadyState() === 'ACTIVE')
                    {
                        console.log('CompleteCall: Offer received while active. RESET PEER CONNECTION.');
                        this.ResetPeerConnection();
                    }

                    console.log('Completing call...');
    //                console.log('CompleteCall: Offer-SDP=' + offer);

                    console.log('  CompleteCall: Setting SetRemoteDescription as OFFER');
                    this.peer_connection.SetRemoteDescription('OFFER', offer);

                    sdp = this.peer_connection.CreateAnswer(offer, {audio: true, video: true});
//                  console.log('CompleteCall: Answer-SDP=' + sdp);
                    console.log('  CompleteCall: Setting SetLocalDescription as ANSWER');
                    this.peer_connection.SetLocalDescription('ANSWER', sdp, function() {
                        console.log('CompleteCall: Success - setting local and starting ICE machine.');
                        self.peer_connection.StartIce();
                        self.bIceStarted = true;
                        var answer = $msg({to: self.jid, type: 'chat'})
                                .c('answer', {xmlns: Callcast.NS_CALLCAST}).t(sdp);

                        // Now send our SDP/answer.
                        Callcast.connection.send(answer);
                    }, function(msg) {
                        console.log('CompleteCall: SetLocalDescription: FAIL: ' + msg);
                    });

                    this.CallState = Callcast.CallStates.CONNECTED;
                }
                else {
                    console.log('Could not complete call. Peer_connection is invalid.');
                }
            }
            catch (e) {
                console.log('EXCEPTION: ', e.toString(), e);
            }
        };

        this.InboundIce = function(candidate) {
            var i, len;

            try {
                if (this.peer_connection && this.peer_connection.ReadyState() === 'ACTIVE')
                {
                    if (this.bIceStarted) {
                        console.log('InboundIce: Got Candidate - ' + candidate);

                        // Process change: process the most recent candidate,
                        // and then iterate through the .candidates array
                        // processing each of them in turn as well.
                        this.peer_connection.ProcessIceMessage(candidate);

                        // NOTE: If re-processing seems to cause a problem, it
                        // can be defeated by simply deleting or commenting out
                        // the for() loop below or setting 'len = 0;'
                        len = this.candidates.length;
                        for (i = 0 ; i < len ; i += 1)
                        {
                            console.log('  Re-processing prior candadate # ' + i);
                            this.peer_connection.ProcessIceMessage(this.candidates[i]);
                        }

                        // Now add the current one to the array.
                        this.candidates.push(candidate);
                    }
                    else {
                        console.log('WARNING: Ice machine not started yet but received an inbound Ice Candidate.');
                    }
                }
                else {
                    if (!this.peer_connection) {
                        console.log('Could not process ICE message. Peer_connection is invalid.');
                    }
                    else {
                        console.log('Could not process ICE message. Peer_connection state not ACTIVE. Currently === ' +
                                this.peer_connection.ReadyState());
                    }
                }
            }
            catch (e) {
                console.log('EXCEPTION: ', e.toString(), e);
            }
        };

        this.InboundAnswer = function(sdp) {
            try {
                if (this.peer_connection)
                {
                    console.log('  InboundAnswer: Setting SetRemoteDescription as ANSWER');
                    this.peer_connection.SetRemoteDescription('ANSWER', sdp);
                    self.peer_connection.StartIce();
                    self.bIceStarted = true;
                }
                else {
                    console.log('Could not process answer message. Peer_connection is invalid.');
                }
            }
            catch (e) {
                console.log('EXCEPTION: ', e.toString(), e);
            }
        };

        this.RemovePlugin = function() {
            // Now remove object from div
            var nick = Strophe.getResourceFromJid(this.jid);
            // Make sure it has no spaces...
            if (nick) {
                nick = nick.replace(/ /g, '');
            }

            if (Callcast.Callback_RemovePlugin) {
                Callcast.Callback_RemovePlugin(nick);
            }
            else {
                alert('ERROR: RemovePlugin: Callcast.setCallbackForRemovePlugin() has not been called yet.');
            }
        };

        this.DropCall = function() {
            if (this.peer_connection)
            {
                console.log('Dropping call for ' + this.jid);
                this.peer_connection = null;
            }

            this.RemovePlugin();
        };

        if (Callcast.Callback_AddPlugin) {
            this.AddPluginResult = Callcast.Callback_AddPlugin(nickname);
        }
        else {
            console.log('Callee: ERROR: Init failure. No AddPlugin callback available.');
        }
        this.InitPeerConnection();
    },

    escapeit: function(msg) {
        return msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    log: function(msg) {
 //     $('#log').append(this.escapeit(msg) + "<br>");

        // This version is required for peer_connection.onlogmessage -- console.log doesn't work and escaped <br> version doesnt work.
        console.log(msg);
//      $('#log').append("<p>" + msg + "</p>");
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
         Callcast.connection.muc.listRooms(Callcast.CALLCAST_ROOMS, function(thelist) {
             Callcast.roomlist = {};    // Remove all entries from the rooms list.

             $(thelist).find('item').each(function() {
                 Callcast.roomlist[$(this).attr('jid')] = $(this).attr('name');
             });

             $(document).trigger('roomlist_updated');
         });
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
            console.log('Got inbound call-offer from ' + $(msg).attr('from'));

            if (!Callcast.participants[res_nick])
            {
                console.log('ERROR: Participant for nick=' + res_nick + ' not found. Who is this guy?');
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
            console.log('Got inbound answer from ' + $(msg).attr('from'));

            if (!Callcast.participants[res_nick])
            {
                console.log('ERROR: Participant for nick=' + res_nick + ' not found. Who is this guy?');
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
            console.log('Got inbound signaling-message from ' + $(msg).attr('from'));

            sdp = $(msg).children('signaling').text().replace(/&quot;/g, '"');

            if (Callcast.participants[res_nick]) {
                Callcast.participants[res_nick].InboundIce(sdp);
            }
            else {
                console.log("Error with inbound signaling. Didn't know this person: " + res_nick);
            }
        }
        else if ($(msg).find('cmd').length > 0)
        {
            Callcast.process_multi_command(msg);
        }
        else if ($(msg).find('x').length > 0)
        {
            console.log('Got inbound INVITATION to join a session.');
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

        console.log('Group Command: ', msgToSend.toString());

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
        var pres = $pres({to: this.SWITCHBOARD_FB, intro_sr: this.fbsr, intro_at: this.fbaccesstoken})
            .c('x', {xmlns: 'http://jabber.org/protocol/muc'});

        // Now that we're connected, let's send our presence info to the switchboard and FB info.
        // Note - we're going to send our INTRO_SR buried in our presence.
        //        This way, the switchboard will know who we are on facebook when our presence is seen.

        if (this.connection && this.connection.connected && this.connection.authenticated)
        {
            this.fb_sent_pres = true;
            this.connection.send(pres);
        }
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

                console.log('Processing cmd: ', items[i]);
//                console.log('info is: ', info);
                cmdtype = $(items[i]).attr('cmdtype');

                // Lop off all the children that may be present (originals or ones from the prior iteration)
                $(newmsg).children('cmd').remove();
                // Now we need to add the current 'items[i]' into the mix as a child.
                $(newmsg).append(items[i]);

                console.log('Newly constituted message: ', newmsg);

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
                    console.log('addspot: Received object: ', info);
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
                    console.log('setspot: Received object: ', info);
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
                    console.log('process_multi_command: ERROR: failed processing cmd.');
                    return false;
                }
            }
        }
        else {
            console.log('Did not find cmd children in message. Ignoring.');
        }

        return ret;
    },

    on_callcast_groupchat_command: function(message) {
        var ret;

        console.log('Groupchat command received: ', message);

        ret = Callcast.process_multi_command(message);
        if (!ret) {
            console.log('on_callcast_groupchat_command: ERROR: failed processing cmd.');
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
        this.SendDirectPrivateChat('LIVELOG ; ' + this.nick + ' ; ' + msg, this.ROOMMANAGER);
    },

    SendFeedback: function(msg) {
        if (this.connection) {
            this.connection.send($msg({to: this.FEEDBACK_BOT, nick: this.nick, room: this.room.split('@')[0]}).c('body').t(msg));
        }
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
//      console.log("STANDARD MESSAGE:");
//      console.log(msg);
        return true;
    },

    PresHandler: function(presence) {
            var from = $(presence).attr('from'),
                room = Strophe.getBareJidFromJid(from),
                info, nick, user_jid;

            if ($(presence).attr('usertype') === 'silent')    // Overseer/serverBot
            {
                // Let's grab the name of the overseer for future reference...
                Callcast.overseer = from;
                return true;
            }

            console.log(presence);
            console.log('From-NICK: ' + $(presence).attr('from'));
//          return true;
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
                    info.hasVid = Callcast.participants[nick].videoOn;

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
                    else {
                        console.log('PresHandler: Error joining room. Disconnecting.');
                    }

                    Callcast.disconnect();
                }
                else if (nick === Callcast.nick && $(presence).attr('type') === 'unavailable')
                {
                    // We got kicked out
                    // So leave and come back?
                    Callcast.LeaveSession();
                    alert('We got kicked out of the session for some reason.');
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
                            Callcast.participants[nick].InitiateCall();
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
                            info.hasVid = Callcast.participants[nick].videoOn;
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
                        Callcast.joined = true;
                        Callcast.SendMyPresence();
                        $(Callcast).trigger('my_join_complete', nick);
                    }

                } else if (Callcast.participants[nick] && $(presence).attr('type') === 'unavailable') {

                    console.log("Caller '" + nick + "' has dropped. Destroying connection.");
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
    CreateUnlistedAndJoin: function(roomname, cb) {
        var roommanager = this.ROOMMANAGER,
            self = this;

        //
        this.connection.sendIQ($iq({
            to: roommanager,
            id: 'roomcreate1',
            type: 'set'
          }).c('room', {xmlns: this.NS_CALLCAST, name: roomname.toLowerCase()}),

        // Successful callback...
          function(iq) {
              if ($(iq).find('ok')) {
                  if (roomname === '') {
                    // Asked to create a random room - must retrieve name...
                    roomname = $(iq).find('ok').attr('name');
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
              console.log('Error creating room', iq);
          }
        );
    },

    //
    // TODO: roomname seems to be unused and show be removed - will effect all current users of the function.
    //
    JoinSession: function(roomname, roomjid) {
        Callcast.room = roomjid.toLowerCase();
        Callcast.roomjid = roomjid.toLowerCase();

        // We need to ensure we have a nickname. If one is not set, use the JID username
        if (!Callcast.nick || Callcast.nick === '') {
            Callcast.nick = Strophe.getNodeFromJid(this.connection.jid);
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

         this.connection.muc.join(roomjid, Callcast.nick, Callcast.MsgHandler, Callcast.PresHandler); //, null);
         Callcast.SendLocalVideoToPeers(Callcast.bUseVideo);

         $(document).trigger('joined_session');

        // Handle all webrtc-based chat messages within a MUC room session
        // Also to handle all INVITATIONS to join a session which are sent directly to the jid and not within the MUC
// Already registered globally on connect        Callcast.connection.addHandler(Callcast.CallMsgHandler, Callcast.NS_CALLCAST, "message", "chat");
        return true;
    },

    LeaveSession: function() {
        if (Callcast.room === null || Callcast.room === '')
        {
//          alert("Not currently in a session.");
            return;
        }

        this.WriteUpdatedState();
        this.connection.muc.leave(Callcast.room, Callcast.nick, null);

        this.DropAllParticipants();

        Callcast.joined = false;
        Callcast.room = '';
        Callcast.roomjid = '';

        this.SendLocalVideoToPeers(this.bUseVideo);

        $(document).trigger('left_session');
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
                     invite = $msg({from: Callcast.connection.jid, to: to_whom, type: 'chat'})
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

    handle_ping: function(iq) {
        var pong = $iq({to: $(iq).attr('from'), id: $(iq).attr('id'), type: 'result'});
//      console.log("PING Received: PONG = ", pong.toString());

        Callcast.connection.send(pong);
        return true;
    },

    disconnect: function() {

        this.DropAllParticipants();
        this.MuteLocalAudioCapture(false);

        this.LeaveSession();

        // Zero it out. The conneciton is no longer valid.
        if (typeof (Storage) !== 'undefined') {
            sessionStorage.clear();
        }

        if (this.connection)
        {
            this.connection.sync = true;
            this.connection.flush();
            this.connection.disconnect();
        }

        // remove dead connection object
        this.connection = null;
        this.joined = false;
        this.room = '';
        this.nick = '';

        $(document).trigger('disconnected');
    },

    conn_callback_reconnect: function(status, err) {

        if (err === 'item-not-found') {
            console.log('Post-Reconnect conn_callback: BOSH responded with item-not-found. Connection is invalid now.');
            Callcast.connect(Callcast.CALLCAST_XMPPSERVER, '');
            return;
        }

        if (err) {
            console.log('Post-Reconnect conn_callback. Status: ' + status + ' Err:', err);
        }
        else {
            console.log('Post-Reconnect conn_callback. Status: ' + status + ' No Err.');
        }

        Callcast.conn_callback_guts(status);
    },

    conn_callback: function(status, err) {
        if (err === 'item-not-found') {
            console.log('Orig conn_callback: BOSH responded with item-not-found. Connection is invalid now.');
            Callcast.connect(Callcast.CALLCAST_XMPPSERVER, '');
            return;
        }

        if (err) {
            console.log('Orig conn_callback. Status: ' + status + ' Err:', err);
        }
        else {
            console.log('Orig conn_callback. Status: ' + status + ' No Err.');
        }

        Callcast.conn_callback_guts(status);
    },

    conn_callback_guts: function(status) {
        console.log('conn_callback: RID: ' + Callcast.connection.rid + ' SID: ' + Callcast.connection.sid);
         if (status === Strophe.Status.CONNECTED) {
             console.log('XMPP/Strophe Finalizing connection and then triggering connected...');
             Callcast.finalizeConnect();
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Connected');
             }
             $(document).trigger('connected');
         } else if (status === Strophe.Status.AUTHENTICATING) {
             console.log('XMPP/Strophe Authenticating...');
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Authenticating');
             }
         } else if (status === Strophe.Status.CONNECTING) {
             console.log('XMPP/Strophe Connecting...');
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Connecting');
             }
         } else if (status === Strophe.Status.ATTACHED) {
             console.log('XMPP/Strophe Re-Attach of connection successful. Triggering re-attached...');
            // Determine if we're in a 'refresh' situation and if so, then re-attach.
            if (typeof (Storage) !== 'undefined' && sessionStorage.room)
            {
                // We need to force a LeaveSession and setup video state too.
                Callcast.room = sessionStorage.room;
                Callcast.nick = sessionStorage.nick;
                Callcast.bUseVideo = sessionStorage.bUseVideo;
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
             console.log('XMPP/Strophe Disconnected.');
             Callcast.disconnect();
             $(document).trigger('disconnected');
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Disconnected');
             }
         } else if (status === Strophe.Status.DISCONNECTING) {
             console.log('XMPP/Strophe is Dis-Connecting...should we try to re-attach here? TODO:RMW');
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Disconnecting');
             }
         } else if (status === Strophe.Status.CONNFAIL) {
             console.log('XMPP/Strophe reported connection failure...attempt to re-attach...');
             console.log('-- Not actually doing anything here yet. TODO: RMW');
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Connection failed');
             }
// RMW: In theory we are supposed to advance RID by one, but Chrome fails it while Firefox is ok. Sigh. No advancing...
//               Callcast.reattach(Callcast.connection.jid, Callcast.connection.sid, new Number(Callcast.connection.rid) + 1, Callcast.conn_callback);

// RMW: SPECIFICALLY SKIPPING RE-ATTACH on CONNFAIL right now. Think it's causing issues.
            console.log('Attempting a reattach() here. Starting doing this again on Aug 2 2012.');
            Callcast.reattach(Callcast.connection.jid, Callcast.connection.sid, Callcast.connection.rid, Callcast.conn_callback);


//           alert("NOTICE -- attempted to auto-re-attach after connection failure. Did we succeed?");
         } else if (status === Strophe.Status.AUTHFAIL) {
             Callcast.disconnect();
             $(document).trigger('disconnected');
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Disconnected');
             }
             alert('XMPP/Strophe Authentication failed. Bad password or username.');
         }
         else {
            console.log('XMPP/Strophe connection callback - unhandled status = ' + status);
             if (Callcast.Callback_ConnectionStatus) {
                Callcast.Callback_ConnectionStatus('Unknown status');
             }
         }
    },

    ///
    /// connect using this JID and password -- and optionally use this URL for the BOSH connection.
    ///
    connect: function(id, pw, url) {
        var self = this,
            boshconn = '/xmpp-httpbind';
        if (url) {
            boshconn = url;
        }

        // Determine if we're in a 'refresh' situation and if so, then re-attach.
        if (typeof (Storage) !== 'undefined')
        {
            // Found an odd bug where jid could have been stored as 'video.gocast.it' (non-authenticated state)
            // This would be invalid for reattaching - so don't do it.
            if (sessionStorage.jid && sessionStorage.jid.split('@')[1] && sessionStorage.sid && sessionStorage.rid)
            {
                this.log('.connect() - we found prior stored info - attempting to re-attach.');

                // We have previous data.
// RMW: In theory we are supposed to advance RID by one, but Chrome fails it while Firefox is ok. Sigh. No advancing...
//              this.reattach(sessionStorage.jid, sessionStorage.sid, new Number(sessionStorage.rid) + 1, this.conn_callback, boshconn);
                this.reattach(sessionStorage.jid, sessionStorage.sid, sessionStorage.rid, this.conn_callback, boshconn);

                // RMW:TODO - Should we be calling SetNickname() here with a prior-stored nickname?
                //   and how does this integrate into facebook - just let it flow? If we were using non-facebook before,
                //   then we should probably presume the same nickname and bypass getting credentials.

                return;
            }
        }

        if (this.connection)
        {
            this.disconnect();
            this.reset();
            this.connection = null;
        }

        this.connection = new Strophe.Connection(boshconn);

        self.connection.connect(id, pw, self.conn_callback);
    },

    reattach: function(jid, sid, rid, cb, url) {
        var boshconn = '/xmpp-httpbind';
        if (url) {
            boshconn = url;
        }

        if (!jid || !sid || !rid || !jid.split('@')[1])
        {
            console.log('Re-attach ERROR: RID/SID/JID is null. RID=' + rid + ', SID=' + sid + ', JID=' + jid);
            return;
        }

        if (this.connection)
        {
            this.connection.pause();
            delete this.connection;
        }

        this.connection = new Strophe.Connection(boshconn);
        this.connection.reset();

        console.log('Re-attaching -- jid=' + jid + ', sid=' + sid + ', rid=' + rid);

        Callcast.connection.attach(jid, sid, rid, Callcast.conn_callback_reconnect);

        if (cb) {
          cb();
        }
    },

    finalizeConnect: function() {
        this.connection.send($pres());
        this.SendFBPres();

/*
 Callcast.connection.rawInput = function(data) {
                if ($(data).children()[0])
                        console.log("RAW-IN:", $(data).children()[0]);
                else
                        console.log("RAW-IN:", $(data));

        };

Callcast.connection.rawOutput = function(data) {
                if ($(data).children()[0])
                        console.log("RAW-OUT:", $(data).children()[0]);
                else
                        console.log("RAW-OUT:", $(data));
        };
*/

        // Handle inbound signaling messages
        //Callcast.connection.addHandler(Callcast.handle_webrtc_message, null, "message", "webrtc-message");
        this.connection.addHandler(Callcast.handle_ping, 'urn:xmpp:ping', 'iq', 'get');

        // handle all INVITATIONS to join a session which are sent directly to the jid and not within the MUC
        this.connection.addHandler(Callcast.CallMsgHandler, Callcast.NS_CALLCAST, 'message', 'chat');

        // handle all SYNC_LINKS and custom commands within the MUC
        this.connection.addHandler(Callcast.on_callcast_groupchat_command, Callcast.NS_CALLCAST, 'message', 'groupchat');

        // handle all GROUP CHATS within the MUC
        this.connection.addHandler(Callcast.on_public_message, null, 'message', 'groupchat');

        // handle all PRIVATE CHATS within the MUC
        this.connection.addHandler(Callcast.on_private_message, null, 'message', 'chat');

        // handle any inbound error stanzas (for now) via an alert message.
        this.connection.addHandler(Callcast.onErrorStanza, null, null, 'error');

        // Kick things off by refreshing the rooms list.
        this.RefreshRooms();

//      this.InitGocastPlayer();
//           this.InitGocastPlayer("stun.l.google.com", 19302, function(m){alert("Succ: "+m);},function(m){alert("Fail: "+m);});

        // Now -- if a room was specified in the URL, then jump directly in.
        if ($.getUrlVar('unlistedroom'))
        {
            Callcast.JoinSession($.getUrlVar('unlistedroom'),
                                 $.getUrlVar('unlistedroom') + Callcast.AT_CALLCAST_ROOMS);
        }

    }
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
