/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \file ns-callcast.js
 *
 * \brief JavaScript code that implements the Callcast functionality
 *        for the Gocast.it plug-in.
 *
 * \note This code reqires jQuery v1.7.2 and its equivalent to callcast.js
 *       document triggers have been replaced by function calls.
 *
 * \modifier Net-Scale Technologies, Inc.,
 *           <a href="http://www.net-scale.com">www.net-scale.com</a>\n
 *           Modified April 15, 2012 (paula.muller@net-scale.com)
 *
 * Copyright (c) 2012 XVD. All rights reserved.
 */
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

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

var Callcast = {
	PLUGIN_VERSION_CURRENT: 1.19,
	PLUGIN_VERSION_REQUIRED: 1.18,
	PLUGIN_DOWNLOAD_URL: "http://video.gocast.it/plugin.html",
	NOANSWER_TIMEOUT_MS: 6000,
	CALLCAST_XMPPSERVER: "video.gocast.it",
	CALLCAST_ROOMS: "gocastconference.video.gocast.it",
	AT_CALLCAST_ROOMS: "@gocastconference.video.gocast.it",
	NS_CALLCAST: "urn:xmpp:callcast",
	STUNSERVER: "video.gocast.it",
	FEEDBACK_BOT: "feedback_bot_friends@video.gocast.it",
	STUNSERVERPORT: 19302,
	Callback_AddPlugin: null,
	Callback_RemovePlugin: null,
    connection: null,
    localplayer: null,
    participants: {},
    room: "",
    roomjid: "",
    roomlist: {},
    nick: "",
    joined: false,
    keepAliveTimer: null,
    bUseVideo: true,
    WIDTH: 128,
    HEIGHT: 96,
    overseer: null,

    CallStates: {
    	NONE: 0,
    	AWAITING_RESPONSE: 1,
    	CONNECTED: 2
    },

	setCallbackForAddPlugin: function(cb) {
		this.Callback_AddPlugin = cb;
	},

	setCallbackForRemovePlugin: function(cb) {
		this.Callback_RemovePlugin = cb;
	},

    keepAlive: function() {
    	this.keepAliveTimer = setInterval(function() {
    		if (Callcast.connection)
			{
	    		Callcast.connection.sendIQ($iq({to: Callcast.CALLCAST_XMPPSERVER, from: Callcast.connection.jid, type: 'get', id: 'ping1'})
	    						.c('ping', {xmlns: 'urn:xmpp:ping'}),
	    		null, // No action for a successful 'pong'
	    		function() {
	    			alert("Ping failed. Lost connection with server?");
	    		});
			}
    		else
    			alert("Server connection failed.");
		}, 10000);
    },

    NoSpaces: function(str) {
    	if (str)
	    	return str.replace(/ /g, '\\20');
	    else
	    	return null;
    },

    WithSpaces: function(str) {
    	if (str)
	    	return str.replace(/\\20/g, ' ');
	    else
	    	return null;
    },

    onErrorStanza: function(err) {
        var from = $(err).attr('from');
        var nick = Strophe.getResourceFromJid(from);
        if (nick)
        	nick = nick.replace(/\\20/g,' ');

        // Need to cope with a few error stanzas.

    	// #1 - If a user becomes unavailable and we're sending signaling / invitation messages, we'll get an error.
    	if ($(err).find("recipient-unavailable").length > 0)
    		console.log("INFO: Recipient " + nick + " became unavailable.");
    	else if ($(err).find("conflict").length > 0)
    	{
    		alert("The nickname '" + nick + "' is already in use.\nPlease choose a different nickname.");
    		this.disconnect();
    	}
    	else if ($(err).find("service-unavailable").length > 0)
    	{
    		alert("Could not enter room. Likely max # users reached in this room.");
    		this.LeaveSession();
    	}
    	else if ($(err).find('not-allowed').length > 0)
    	{
          // Handled inside PresHandler          roomCreationNotAllowed(room);
        }
	else if ($(err).find('registration-required').length > 0)
	{
			alert("Room is currently locked. You may attempt to KNOCK to request entry.");
			this.LeaveSession();
	}
	else if ($(err).find('forbidden').length > 0)
	{
			alert("Someone in the room has blocked your admission.\nKnocking is being ignored as well.");
			this.LeaveSession();
	}
    	else
    	{
			alert("Unknown Error Stanza: " + $(err).children('error').text());
			console.log($(err));
    	}

    	return true;
    },

    DropAllParticipants: function() {
		for (k in Callcast.participants) {
			Callcast.participants[k].DropCall();
			delete Callcast.participants[k];
		}

		Callcast.participants = {};
    },


	pluginUpdateAvailable: function() {
		if (this.localplayer)
			return this.GetVersion() < this.PLUGIN_VERSION_CURRENT;
		else
			return true;
	},

	pluginUpdateRequired: function() {
		if (this.localplayer)
			return this.GetVersion() < this.PLUGIN_VERSION_REQUIRED;
		else
			return true;
	},

    GetVersion: function() {
    	if (this.localplayer)
    		return parseFloat(this.localplayer.version);
    	else
    		return null;
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
		if (v_use===true)
			this.bUseVideo = true;
		else if (v_use===false)
			this.bUseVideo = false;
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

			if (info.width>=0 && info.height>=0)
			{
				this.participants[nick].peer_connection.width  = info.width;
				this.participants[nick].peer_connection.height = info.height;
			}
			else if (info.hasVid===true)
			{
				this.participants[nick].peer_connection.width  = this.WIDTH;
				this.participants[nick].peer_connection.height = this.HEIGHT;
			}
			else if (info.hasVid===false)
			{
				this.participants[nick].peer_connection.width  = 0;
				this.participants[nick].peer_connection.height = 0;
			}
		}
		else
			console.log("ShowRemoteVideo: nickname not found: " + nick);
	},

	MuteLocalVoice: function(bMute) {
		if (Callcast.localplayer)
			Callcast.localplayer.muteLocalVoice(bMute);
	},

	SendLocalVideoToPeers: function(send_it) {
		if (send_it !== null)
			this.bUseVideo = send_it;

		// Turn on/off our preview based on this muting of video too.
		if (this.localplayer)
		{
			if (this.bUseVideo===true)
			{
				this.localplayer.width = this.WIDTH;
				this.localplayer.height = this.HEIGHT;
				this.localplayer.startLocalVideo();
			}
			else
			{
//			console.log("DEBUG: Pre-StopLocalVideo() inside SendLocalVideoToPeers");
				this.localplayer.stopLocalVideo();
//			console.log("DEBUG: Post-StopLocalVideo() inside SendLocalVideoToPeers");
				this.localplayer.width = 0;
				this.localplayer.height = 0;
			}

			if (this.joined)
				this.SendVideoPresence();
		}
	},

	SendVideoPresence: function() {
		var pres;
		if (this.bUseVideo==true)
			pres = $pres({to: this.roomjid + "/" + this.NoSpaces(this.nick), video: 'on'}).c('x',{xmlns: 'http://jabber.org/protocol/muc'});
		else
			pres = $pres({to: this.roomjid + "/" + this.NoSpaces(this.nick), video: 'off'}).c('x',{xmlns: 'http://jabber.org/protocol/muc'});

		console.log("SendVideoPresence: ", pres.toString());
		this.connection.send(pres);
	},

    InitGocastPlayer: function(stunserver_in, stunport_in, success, failure) {
		var stunserver = stunserver_in || this.STUNSERVER;
		var stunport = stunport_in || this.STUNSERVERPORT;

                // Local player is initialized outside this function.
    	if (!this.localplayer)
    		alert("Gocast Player object not found in DOM. Plugin problem?");

		// Initialize local and show local video.
		this.localplayer.initLocalResources(stunserver, stunport,
			function(message) {
				Callcast.localplayer.onlogmessage = function(message) { console.log("GCP-Local: " + message); }

				//
				// Despite Manjesh making a call upon init to stop the capture, on first load
				// the capture continues on Mac - so we'll force it to stop here just in case.
				//
				Callcast.localplayer.startLocalVideo();
				Callcast.localplayer.stopLocalVideo();

				Callcast.localplayer.width=0;
				Callcast.localplayer.height=0;

				if (success)
					success(message);
			},
			function(message) {
				alert("Gocast Player - Initialization of local resources failed." + message);
				if (failure)
					failure(message);
			});

    },

    DeInitGocastPlayer: function() {

    	if (this.localplayer)
    	{
    		this.localplayer.deinitLocalResources();

    		// TODO - must REMOVE from HTML the object.
    		this.localplayer = null;
    	}
    },

    Callee: function(nickin, room) {
    	// Ojbect for participants in the call or being called (in progress)
    	var nickname = nickin;
    	var videoOn = null;	// Unknown if video is on, off, or unknown. So unknown for now...

    	// Nickname must be sure to NOT have spaces here.
    	nickname = nickname.replace(/ /g,'');

    	// The JID must stay original or messages won't get through.
    	this.jid = room + "/" + nickin.replace(/ /g,'\\20');
    	this.non_muc_jid = "";
    	this.CallState = Callcast.CallStates.NONE;

    	if (Callcast.Callback_AddPlugin)
    	{
    		this.peer_connection = Callcast.Callback_AddPlugin(nickname);

			if (!this.peer_connection)
				alert("Gocast Player object not found in DOM. Plugin problem?");
    	}
    	else
    		alert("ERROR: Callcast.setCallbackForAddPlugin() has not been called yet.");

    	self = this;

//    	this.onSignalingMessage = function(message) {
//        	if (this.jid === null)
//                console.log("ERROR - message to be sent - but no recipient yet.");
//        	else
//            {
//                    var offer = $msg({to: this.jid, type: "chat"}).c('initiating', {xmlns: Callcast.NS_CALLCAST}).t(message);
//	                console.log("Sending message to peer..." + this.jid);
//                    Callcast.connection.send(offer);
//                    this.CallState = Callcast.CallStates.AWAITING_RESPONSE;
//            }
//    	};

    	if (!this.peer_connection)
    		console.log("FAILED to create peer connection object.");
    	else
    	{
	        this.peer_connection.onlogmessage = Callcast.log;
            this.peer_connection.onaddstream = function(streamId, bVideo) {
                var logMessage = 'Remote peer added ' + (bVideo? 'video ': 'audio ') + 'stream: ' + streamId;
                console.log(logMessage);
	        };

	        this.peer_connection.onremovestream = function(streamId, bVideo) {
	                var logMessage = 'Remote peer removed ' + (bVideo? 'video ': 'audio ') + 'stream: ' + streamId;
	                console.log(logMessage);
	        };

//	        this.peer_connection.onsignalingmessage = this.onSignalingMessage;
	        this.peer_connection.onsignalingmessage = function(message) {
	        	// If message does *NOT* start with "{", then we have our special message.
	        	// Special message is of the form JID~message
	        	var callback_jid = "";
	        	var callback_msg = "";

	        	if (message[0] !== "{")
	        	{
	        		var msgsplit = message.split("~");
	        		callback_jid = msgsplit[0];
	        		callback_msg = msgsplit[1];
	        	}
	        	else
	        	{
	        		callback_jid = self.jid;
	        		callback_msg = message;
	        	}

	        	if (!callback_jid || callback_jid == "")
                    console.log("ERROR - message to be sent - but no recipient yet.");
	        	else
                    {
						var nick = Strophe.getResourceFromJid(callback_jid);
						if (nick)
							nick = nick.replace(/\\20/g, ' ');

                    	if (Callcast.participants[nick].CallState === Callcast.CallStates.NONE)
                    	{
                            var offer = $msg({to: callback_jid, type: "chat"}).c('initiating', {xmlns: Callcast.NS_CALLCAST}).t(callback_msg);
        	                console.log("Sending initiation message to peer...");
                            Callcast.connection.send(offer);
                            Callcast.participants[nick].CallState = Callcast.CallStates.AWAITING_RESPONSE;
                        }
                        else
                        {
                            var offer = $msg({to: callback_jid, type: "chat"}).c('signaling', {xmlns: Callcast.NS_CALLCAST}).t(callback_msg);
        	                console.log("Sending other (candidates) message to peer...");
                            Callcast.connection.send(offer);
                        }
                }

	        };

			this.peer_connection.onreadystatechange = function(state) {
				console.log("Ready-State=" + state);
			};

	        this.peer_connection.init(this.jid);

    	};

    	this.InitiateCall = function() {
    		if (this.peer_connection)
    		{
				//
				// Now that we're ready, bring the peer_connection online and kick it off.
				//
				var calltype = " - Audio Only.";
				var bVideo = Callcast.bUseVideo;

				if (bVideo)
					calltype = " - Audio+Video.";

				console.log("Commencing to call " + this.jid + calltype);

				this.peer_connection.addStream('audio'+Callcast.nick, false);
				// We will always add the stream -- but may not send the video.
				this.peer_connection.addStream('video'+Callcast.nick, true);

				this.peer_connection.connect();

				// Oddball case where peer connection will wind up sending our video
				// to the peer if they offer video and we don't.
				if (Callcast.bUseVideo === false)
					Callcast.SendLocalVideoToPeers(Callcast.bUseVideo);
			}
			else
				console.log("Cannot InitiateCall - peer_connection is invalid.");
    	};

    	this.CompleteCall = function(inbound) {
    		if (this.peer_connection)
    		{
	    		console.log("Completing call...");
				this.peer_connection.processSignalingMessage(inbound);
				this.CallState = Callcast.CallStates.CONNECTED;
			}
			else
				console.log("Could not complete call. Peer_connection is invalid.");
    	};

    	this.DropCall = function() {
    		if (this.peer_connection)
    		{
	    		console.log("Dropping call for "+this.jid);
    			this.peer_connection.close();
    			this.peer_connection = null;
    			// Now remove object from div
    			var nick = Strophe.getResourceFromJid(this.jid);
    			// Make sure it has no spaces...
				if (nick)
					nick = nick.replace(/ /g, '');

				if (Callcast.Callback_RemovePlugin)
					Callcast.Callback_RemovePlugin(nick);
				else
					alert("ERROR: Callcast.setCallbackForRemovePlugin() has not been called yet.");
    		}
    		else
    			console.log("Dropping FAILED. Cant find peer_connection (or self)");
    	};
    },

    escapeit: function(msg) {
   	    return msg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    },

    log: function (msg) {
 //    	$('#log').append(this.escapeit(msg) + "<br>");

    	// This version is required for peer_connection.onlogmessage -- console.log doesn't work and escaped <br> version doesnt work.
    	console.log(msg);
//    	$('#log').append("<p>" + msg + "</p>");
    },

    accepted: function(iq) {
    	Callcast.log("Got an accepted call.");
    },

    rejected: function(iq) {
    	Callcast.log("Call was rejected.");
    },

    initCallError: function(iq) {
    	Callcast.log("Initiating call resulted in an error.");
    },

    ///
    /// Grab the room list from the server, and put it in an array of .roomlist[jid] = roomname
    /// Then trigger 'roomlist_updated' for the UI portion to react.
    ///
    RefreshRooms: function(ui_element) {
    	 Callcast.connection.muc.listRooms(Callcast.CALLCAST_ROOMS, function(thelist) {
    		 Callcast.roomlist = {};	// Remove all entries from the rooms list.

    	     $(thelist).find("item").each(function () {
    	    	 Callcast.roomlist[$(this).attr('jid')] = $(this).attr('name');
    	     }) ;
             roomListUpdate();
    	 });
    },

    CallMsgHandler: function(msg) {
    	var res_nick = Strophe.getResourceFromJid($(msg).attr('from'));
    	if (res_nick)
    		res_nick = res_nick.replace(/\\20/g,' ');


    	// Inbound call - initiating
       	if ($(msg).find('initiating').length > 0)
    	{
	    	console.log("Got inbound call-message from " + $(msg).attr('from'));

	    	if (!Callcast.participants[res_nick])
	    	{
	    		console.log("ERROR: Participant for nick=" + res_nick + " not found. Who is this guy?");
	    		return true;
	    	}

	    	//
	    	// Otherwise, we already know this guy - so complete the call.
	    	//
	    	var inbound = $(msg).children('initiating').text().replace(/&quot;/g, '"');

	    	Callcast.participants[res_nick].CompleteCall(inbound);
    	}

       	if ($(msg).find('signaling').length > 0)
    	{
	    	console.log("Got inbound signaling-message from " + $(msg).attr('from'));

	    	var inbound = $(msg).children('signaling').text().replace(/&quot;/g, '"');

	    	if (Callcast.participants[res_nick] && Callcast.participants[res_nick].peer_connection)
	    		Callcast.participants[res_nick].peer_connection.processSignalingMessage(inbound);
	    	else
	    		console.log("Error with inbound signaling. Didn't know this person: " + res_nick);
		}

    	if ($(msg).find('x').length > 0)
    	{
    		console.log("Got inbound INVITATION to join a session.");
    		var invite = $(msg).find('x');
    		var from = $(msg).attr('from');
    		var roomjid = $(invite).attr('jid');
    		var password = $(invite).attr('password');
    		var reason = $(invite).attr('reason');

    		// Put up an approval dialog and work from there to join or not join the call.

    		$('#approval_dialog').append('<p>Ring Ring: Call from ' + Strophe.getBareJidFromJid(from) + ". Ring Ring...</p>");
    		if (reason)
        		$('#approval_dialog').append('<p>' + reason + "</p>");

    	    $('#approval_dialog').dialog({
    	        autoOpen: true,
    	        draggable: false,
    	        modal: true,
    	        title: 'Incoming Call From ' + Strophe.getBareJidFromJid(from),
    	        buttons: {
    	            "Answer": function () {
    	            	Callcast.JoinSession(Strophe.getNodeFromJid(roomjid), roomjid);
    	                $(this).dialog('close');
    	            },
    	    		"Ignore": function() {
    	    			$(this).dialog('close');
    	    			alert("Incoming call request was ignored.");
    	    		}
    	        }
    	    });


    	}

    	return true;
    },

    SendSyncLink: function(txt) {
    	var sync = $msg({to: this.room, type: 'groupchat', xmlns: Callcast.NS_CALLCAST}).c('body').t(txt);
    	this.connection.send(sync);
    },

    on_sync_link: function(message) {
        var from = $(message).attr('from');
        var room = Strophe.getBareJidFromJid(from);
        var nick = Strophe.getResourceFromJid(from);
		if (nick)
			nick = nick.replace(/\\20/g, ' ');

		var delayed = $(message).children("delay").length > 0  ||
				$(message).children("x[xmlns='jabber:x:delay']").length > 0;

		if (delayed)
				console.log("Ignoring delayed sync link:" + $(message).children('body').text());

		if (room == Callcast.room && !delayed)
		{
			if (nick == Callcast.nick)
				return true;

			syncLink($(message).children('body').text());
		}

		return true;
    },

    SendPublicChat: function(msg) {
      var chat = $msg({to: this.room, type: 'groupchat'}).c('body').t(msg);
      this.connection.send(chat);
    },

    SendPrivateChat: function(msg, to) {
      var chat = $msg({to: this.room + "/" + to.replace(/ /g,'\\20'), type: 'chat'}).c('body').t(msg);
      this.connection.send(chat);
    },

    SendFeedback: function(msg) {
    	if (this.connection)
	    this.connection.send($msg({to:this.FEEDBACK_BOT, nick: this.nick, room: this.room.split('@')[0]}).c('body').t(msg))
    },

    on_public_message: function(message) {
        var xmlns = $(message).attr('xmlns');
        var from = $(message).attr('from');
        var room = Strophe.getBareJidFromJid(from);
        var nick = Strophe.getResourceFromJid(from);
        if (nick)
        	nick = nick.replace(/\\20/g,' ');

        // make sure message is from the right place
        if (room === Callcast.room && xmlns !== Callcast.NS_CALLCAST) {
            // is message from a user or the room itself?
            var notice = !nick;

            // messages from ourself will be styled differently
            var nick_class = "nick";
            if (nick === Callcast.nick) {
                nick_class += " self";
            }

            var body = $(message).children('body').text();

            var delayed = $(message).children("delay").length > 0  ||
                $(message).children("x[xmlns='jabber:x:delay']").length > 0;

            // look for room topic change
//            var subject = $(message).children('subject').text();
//            if (subject) {
//                $('#room-topic').text(subject);
//            }

			var msginfo = { nick: nick, nick_class: nick_class, body: body, delayed: delayed, notice: notice };

			publicMessage(msginfo);

        }

        return true;
    },

    on_private_message: function(message) {
        var xmlns = $(message).attr('xmlns');
        var from = $(message).attr('from');
        var room = Strophe.getBareJidFromJid(from);
        var nick = Strophe.getResourceFromJid(from);
        if (nick)
        	nick = nick.replace(/\\20/g,' ');

        // make sure message is from the right place
        if (room === Callcast.room && xmlns !== Callcast.NS_CALLCAST) {
            var body = $(message).children('body').text();

			if (!body)
				return true;	// Empty body - likely a signalling message.

			var msginfo = { nick: nick, body: body };

			privateMessage(msginfo);
        }

        return true;
    },

    MsgHandler: function(msg) {
//    	console.log("STANDARD MESSAGE:");
//    	console.log(msg);
    	return true;
    },

    PresHandler: function(presence) {
            var from = $(presence).attr('from');
            var room = Strophe.getBareJidFromJid(from);

		if ($(presence).attr('usertype')==='silent')	// Overseer/serverBot
		{
			// Let's grab the name of the overseer for future reference...
			this.overseer = from;
			return true;
		}


        	console.log(presence);
        	console.log("From-NICK: " + $(presence).attr('from'));
//        	return true;
            // make sure this presence is for the right room
            if (room === Callcast.room) {
                var nick = Strophe.getResourceFromJid(from);
                if (nick)
                	nick = nick.replace(/\\20/g,' ');

				// Marking presence of video or lack of video if other side has noted it.
				if (Callcast.participants[nick])
				{
					if ($(presence).attr('video'))
					{
						Callcast.participants[nick].videoOn = $(presence).attr('video')==='on';
					}
					else
						Callcast.participants[nick].videoOn = null;

					// Update the presence information.
					var info = {nick: nick, hasVid: Callcast.participants[nick].videoOn};
					userUpdated(info);
				}
				else if (nick == Callcast.nick && $(presence).attr('video'))
				{
					// Update the presence information.
					var info = {nick: nick, hasVid: Callcast.bUseVideo};
					userUpdated(info);
				}

                if ($(presence).attr('type') === 'error' && !Callcast.joined) {
                    // error joining room; reset app
                    if ($(presence).find('not-allowed').length > 0)
                      roomCreationNotAllowed(Strophe.getNodeFromJid(room));
                    else
	                	console.log("PresHandler: Error joining room. Disconnecting.");

                    Callcast.disconnect();
                }
                else if (nick == Callcast.nick && $(presence).attr('type') == 'unavailable')
                {
                	// We got kicked out
                	// So leave and come back?
                	Callcast.LeaveSession();
                	alert("We got kicked out of the session for some reason.");
                }
                else if (!Callcast.participants[nick] && $(presence).attr('type') !== 'unavailable') {
                    // add to participant list
                	// Make sure we ONLY add **OTHERS** to the participants list.
                	// Otherwise we'll wind up calling ourselves.
                    var user_jid = $(presence).find('item').attr('jid');

                    //
                    // No matter what, we need to add this participant to the room/call.
                    // (Except when the new participant is ourselves. :-)
                    //
                    if (nick !== Callcast.nick)
                    {
	                    Callcast.participants[nick] = new Callcast.Callee(nick, room);
	                    if (user_jid)
	                    	Callcast.participants[nick].non_muc_jid = user_jid;

	                    // Now, if we are new to the session (not fully joined ye) then it's our job to call everyone.
	                    if (!Callcast.joined)
                        	Callcast.participants[nick].InitiateCall();
                    }

					// Check to see if video-on/off is specified.
					if (nick !== Callcast.nick)
					{
						if ($(presence).attr('video'))
						{
							Callcast.participants[nick].videoOn = $(presence).attr('video')==='on';
						}
						else
							Callcast.participants[nick].videoOn = null;
					}

                    //
                    // Inform the UI that we have a new user
                    //
                    // Have an odd case where we get re-informed that WE are in the room.
                    // So, if we are already 'joined' and we see ourselves, then don't add to list.
                    //
                    if (!Callcast.joined || (nick !== Callcast.nick))
                    {
                    	var info = {nick: nick};

                    	if (nick !== Callcast.nick)
                    		info.hasVid = Callcast.participants[nick].videoOn;
                    	else
                    		info.hasVid = Callcast.bUseVideo;

                        userJoined(info);
	                }

                    //
                    // Handle our own join in the room which completes the session-join.
                    //
                    if (!Callcast.joined && nick === Callcast.nick)
                    {
                		Callcast.joined = true;
                		Callcast.SendVideoPresence();
                        $(Callcast).trigger('my_join_complete', nick);
                    }

                } else if (Callcast.participants[nick] && $(presence).attr('type') === 'unavailable') {

                    console.log("Caller '" + nick + "' has dropped. Destroying connection.");
                    Callcast.participants[nick].DropCall();
                    delete Callcast.participants[nick];

                    userLeft(nick);
                }

                if ($(presence).attr('type') !== 'error' &&
                    !Callcast.joined) {
                    // check for status 110 to see if it's our own presence
                    if ($(presence).find("status[code='110']").length > 0) {
                        // check if server changed our nick
                        if ($(presence).find("status[code='210']").length > 0) {
                            Callcast.nick = Strophe.getResourceFromJid(from);
                            if (Callcast.nick)
                            	Callcast.nick = Callcast.nick.replace(/\\20/g, ' ');
                        }

                        // room join complete
                        joinedSession();
                    }
                }
            }

            return true;
        },

	CreateUnlistedAndJoin: function(roomname) {

		// Must create the room as unlisted, confirm settings if room doesn't exist and join it.

		Callcast.JoinSession(roomname, roomname+Callcast.AT_CALLCAST_ROOMS);
	},

    JoinSession: function(roomname, roomjid) {
    	Callcast.room = roomjid.toLowerCase();
    	Callcast.roomjid = roomjid;

		// We need to ensure we have a nickname. If one is not set, use the JID username
    	if (!Callcast.nick || Callcast.nick==="")
	    	Callcast.nick = Strophe.getNodeFromJid(this.connection.jid);

    	Callcast.joined = false;

    	Callcast.DropAllParticipants();

		 if (roomname == "" || roomjid == "")
		 {
			 alert("Room and RoomJid must be given to join a session.");
			 return false;
		 }
		 else if (Callcast.joined)
		 {
			 alert("Already in a session. Must leave session first.");
			 return false;
		 }
		 else
		 {
	     	 this.connection.muc.join(roomjid, Callcast.nick, Callcast.MsgHandler, Callcast.PresHandler); //, null);
 			 Callcast.SendLocalVideoToPeers(Callcast.bUseVideo);

                 joinedSession();
	     }

    	// Handle all webrtc-based chat messages within a MUC room session
    	// Also to handle all INVITATIONS to join a session which are sent directly to the jid and not within the MUC
// Already registered globally on connect        Callcast.connection.addHandler(Callcast.CallMsgHandler, Callcast.NS_CALLCAST, "message", "chat");
        return true;
    },

    LeaveSession: function() {
    	if (Callcast.room === null || Callcast.room === "")
		{
//    		alert("Not currently in a session.");
    		return;
		}
    	else
    	{
    		this.connection.muc.leave(Callcast.room, Callcast.nick, null);

    		this.DropAllParticipants();

    		Callcast.joined = false;
    		Callcast.room = "";
    		Callcast.roomjid = "";

    		this.SendLocalVideoToPeers(this.bUseVideo);

                leftSession();
    	}
    },


    handle_ping: function(iq) {
    	console.log("PING Received:");
    	console.log(iq);
    	this.connection.send($iq({to: $(iq).attr('from'), id: $(iq).attr('id'), type: 'result'}));
//    	this.connection.send($iq({from: this.connection.jid, to: $(iq).attr('from'), id: $(iq).attr('id'), type: 'result'}));
    },

    disconnect: function() {
    	clearInterval(this.keepAliveTimer);

		this.DropAllParticipants();
		this.MuteLocalVoice(false);

		if (this.connection)
		{
			this.connection.sync = true;
			this.connection.flush();
			this.connection.disconnect();
		}

    	// remove dead connection object
		this.connection = null;
		this.joined = false;
		this.room = "";
		this.nick = "";

        disconnected();
    },

    ///
    /// connect using this JID and password -- and optionally use this URL for the BOSH connection.
    ///
    connect: function(id, pw, url) {
    	var boshconn = "/xmpp-httpbind";
    	if (url)
    		boshconn = url;

    	if (this.connection)
    		this.disconnect();

    	this.connection = new Strophe.Connection(boshconn);
    	this.connection.reset();

    	this.connection.connect(id, pw, function (status) {
	         if (status === Strophe.Status.CONNECTED) {
	         	 console.log("Finalizing connection and then triggering connected...");
	        	 Callcast.finalizeConnect();
                         connected();
	         } else if (status === Strophe.Status.DISCONNECTED) {
	        	 Callcast.disconnect();
                         disconnected();
	        } else if (status === Strophe.Status.AUTHFAIL) {
	        	 Callcast.disconnect();
                         disconnected();
	             alert("Authentication failed. Bad password or username.");
	         }
    	 });

    },

    finalizeConnect: function() {
    	this.connection.send($pres());
    	this.keepAlive();

    	// Handle inbound signaling messages
    	//Callcast.connection.addHandler(Callcast.handle_webrtc_message, null, "message", "webrtc-message");
    	this.connection.addHandler(Callcast.handle_ping, "urn:xmpp:ping", "iq", "get");

		// handle all INVITATIONS to join a session which are sent directly to the jid and not within the MUC
    	this.connection.addHandler(Callcast.CallMsgHandler, Callcast.NS_CALLCAST, "message", "chat");

		// handle all GROUP CHATS within the MUC
    	this.connection.addHandler(Callcast.on_public_message, null, "message", "groupchat");

		// handle all PRIVATE CHATS within the MUC
    	this.connection.addHandler(Callcast.on_private_message, null, "message", "chat");

		// handle all SYNC_LINKS within the MUC
    	this.connection.addHandler(Callcast.on_sync_link, Callcast.NS_CALLCAST, "message", "groupchat");

	    // handle any inbound error stanzas (for now) via an alert message.
    	this.connection.addHandler(Callcast.onErrorStanza, null, null, 'error');

	    // Kick things off by refreshing the rooms list.
    	this.RefreshRooms();

//    	this.InitGocastPlayer();
//	     	 this.InitGocastPlayer("stun.l.google.com", 19302, function(m){alert("Succ: "+m);},function(m){alert("Fail: "+m);});

    	// Now -- if a room was specified in the URL, then jump directly in.
    	if ($.getUrlVar('unlistedroom'))
    	{
			Callcast.JoinSession($.getUrlVar('unlistedroom'), $.getUrlVar('unlistedroom')+Callcast.AT_CALLCAST_ROOMS);
		}

    },
 };

//
//Grab the url arguments and process/parse them into an array.
//
//Thanks to http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html for this.
//
$.extend({
getUrlVars: function(){
 var vars = [], hash;
 var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
 for(var i = 0; i < hashes.length; i++)
 {
   hash = hashes[i].split('=');
   vars.push(hash[0]);
   vars[hash[0]] = hash[1];
 }
 return vars;
},
getUrlVar: function(name){
 return $.getUrlVars()[name];
}
});

