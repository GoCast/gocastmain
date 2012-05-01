/**
 * First-gen implementation of an XMPP-based protocol for managing WebRTC-based "calls" or "sessions"
 * 
 * Author: Robert Wolff - rwolff@gocast.it
 * 
 * Copyright 2012 GoCast.it
 */

Strophe.addConnectionPlugin('webrtcclient', {

	State: {
		Idle: 0,
		initiating_add: 1,
		responding_to_req_add: 2,
		terminating_session: 3,
		terminating_one_connection: 4,
		error: 5,
	},

	Participant: function() {
		this.jid = "";
		this.nickname = "";
		this.cb_accepted = null;
		this.cb_rejected = null;
	},
	
	Session: function(parent) {
		if (!parent)
			return;
		
		function makesid()
		{
		    var text = "";
		    var possible = "ABCDEF0123456789";

		    for( var i=0; i < 8; i++ )
		        text += possible.charAt(Math.floor(Math.random() * possible.length));

		    return text;
		}
		
		parent.info("Creating new Session.");
		
		this.sessid = this.makesid();
		this.name = "";
		this.originator = "";
		this.state = parent.State.Idle;
		
		this.participants = {};
	},

	//
	// Approval callback is of the form:
	//
	// function approvalCallback(from, string_of_participants, call_upon_acceptance, call_upon_rejection)
	//
	setApproveCallback: function(cb) {
		this.approveCallback = cb;
	},

	init: function (connection) {
        this.connection = connection;
        this.sessions = {};
        this.initQueue = {};
        this.approveCallback = null;

        Strophe.addNamespace('WEBRTCCLIENT', 'jabber:iq:webrtcclient');

        this.testsession = new this.Session(this);
        this.testsession.name = "TestSession";
        this.testsession.originator = connection.jid;
    },

    LogLevel: {
    	DEBUG: 0,
    	INFO: 1,
    	WARN: 2,
    	ERROR: 3,
    },
    
    //
    // Replace with your own via Strophe.connection.webrtcclient.log: function { }
    //
    log: function(level, msg) {
    	return;
    },
    
    info: function(msg) {
    	this.log(this.LogLevel.INFO, "RTC:INFO: ");
    	this.log(this.LogLevel.INFO, msg);
    	return;
    },
    
    debug: function(msg) {
    	this.log(this.LogLevel.DEBUG, "RTC:DEBUG: ");
    	this.log(this.LogLevel.DEBUG, msg);
    	return;
    },
    
    error: function(msg) {
    	this.log(this.LogLevel.ERROR, "RTC:ERROR: ");
    	this.log(this.LogLevel.ERROR, msg);
    	return;
    },
    
    cancelDisconnectTimeout: function() {
    	// TODO - Need to cancel an ongoing timer for timing out in a diconnect situation.
    	debug("Cancelling timeout.");
    },
    
    reconnected: function() {
    	debug("Reconnected.");
    	cancelDisconnectTimeout();
    	
        $(document).trigger('webrtcclient_connected', this);
    },

    startDisconnectTimeout: function() {
    	debug("Beginning timeout period.");
    	// TODO - Need to start a timeout to transit to fully timed out.
    },
    
    disconnected: function() {
    	debug("Disconnected.");

    	startDisconnectTimeout();
    	
        // notify of disconnected state -- eventually time out to fully disconnected?
        $(document).trigger('webrtcclient_disconnected', this);
 	
    },
    
    //
    // called when connection status is changed in Strophe-land.
    //
    statusChanged: function (status) {
        if (status === Strophe.Status.CONNECTED) {
            this.sessions = {};

            // set up handlers for updates
            this.connection.addHandler(this._handle_IQ.bind(this),
                   Strophe.NS.WEBRTCCLIENT, "iq", "set");

            reconnected();
            
        } else if (status === Strophe.Status.DISCONNECTED) {
        	disconnected();

        }
    },
 
    _sendAcceptance: function(iq) {
    	self = this;
    	this.info("_sendAcceptance started.");

    	var from = iq.getAttribute('from');
    	
    	var jingle = $(iq).find('jingle');
    	var initiator = $(jingle).attr('initiator');
    	var sid = $(jingle).attr('sid');
    	
    	// Construct the session-accept and send it.
    	var req = $iq({'from': self.connection.jid, 'to': from, 'type': 'set'})
    		.c('jingle', {'xmlns': Strophe.NS.WEBRTCCLIENT, 'action': 'session-accept', 'initiator': initiator, 'sid': sid});
		
    	this.debug("acceptance: " + req.toString());
    	this.debug(req);
    	
    	this.connection.sendIQ(req, function() {
        	// If we succeed, then we need to start a timer for killing this item from the queue
        	//   after the designated timeout (it means the other side never accepted nor refused)
        	// TODO - timeout mechanism. For now, we assume good behavior and no flakey connections.
  //  		partic.cb_accepted = cb_accepted;
  //  		partic.cb_rejected = cb_rejected;
    		
			self.info("acceptance completed to " + from );
//			self.connection.addHandler(cb, Strophe.NS.JINGLE, 'iq', 'set', id, stanza.getAttribute('from'));
		}, function() {
	    	// If we fail, call the cb_error.
			self.error("acceptance failed to: " + from);
			if (cb_error)
				cb_error(this);
		});
    },
    
    _sendRejection: function(iq) {
    	this.info("_sendRejection started.");
    	
    },
    
    _handle_IQ: function(iq) {
    	// Inbound iq set in our namespace.

    	var action = $(iq).find('jingle').attr('action');
    	switch (action) {
    	case 'session-initiate':
			this._handle_init_reqadd(iq);
			break;
    	case 'session-accept':
			this._handle_accept_reqadd(iq);
    		break;
    	case 'session-info':
    	}

		return true;
    },

    _finalizeAcceptance: function(iq) {
    	_sendAcceptance(iq);
    	
    	var jingle = $(iq).find('jingle');
    	var initiator = $(jingle).attr('initiator');
    	var sid = $(jingle).attr('sid');

    	this.testsession.sid = sid;
    	
    	var partic = new this.Participant();
    	partic.jid = iq.getAttribute('from');
    	partic.nickname = "Unknown";
   	//
    	// Now add participants to session just created.
    	//
    	sess.participants[partic.jid] = partic;
    	
    },
    
    _handle_init_reqadd: function(iq) {
    	this.debug("_handle_init_reqadd: iq: ");
    	this.debug(iq);
    	
    	// ACK must go regardless.
		this.connection.send($iq({'from': this.connection.jid, 'to': iq.getAttribute('from'),
			'id': iq.getAttribute('id'), 'type': 'result'}));

		// If an approveCallback is used, then call it. If not, then ASSUME acceptance.
		if (this.approveCallback)
    	{
    		this.approveCallback(iq.getAttribute('from'), "[People involved in call already...]", this._finalizeAcceptance(iq), this._sendRejection(iq));
    	}
		else
			this._finalizeAcceptance(iq);
		
    },
    
    _handle_accept_reqadd: function(iq) {
    	this.debug("_handle_accept_reqadd: iq: ");
    	this.debug(iq);

    	var from = iq.getAttribute('from');
    	var bare_from = Strophe.getBareJidFromJid(from);
    	
    	// ACK must go regardless.
		this.connection.send($iq({'from': this.connection.jid, 'to': from,
			'id': iq.getAttribute('id'), 'type': 'result'}));

    	if (this.initQueue[from] === null)
    	{
    		error("Got a session-accept from: " + bare_from + " unexpectedly.");
    	}
    	else
    	{
    		// We got an accept from someone we expected. Move the person from initQueue to the session.
    		var part = this.initQueue[from];
    		this.testsession.participants[from] = part;
    		delete this.initQueue[from];
    		
    		this.infolog("Successfully added " + bare_from + " to current session.");
    	}
    },
    
    initiateSession: function(name) {
    	var sess = new this.Session();
    	
    	sess.name = name;
    	sess.originator = "me";
    },
    
    initiateAdd: function(sessionName, to_jid, nick, cb_accepted, cb_rejected, cb_error) {
//    	var sess = sessions[sessionName];
    	// TODO - use session array.
    	var sess = this.testsession;
    	
    	this.info("Initiating an 'add' to: " + to_jid);
    	
    	if (sess === null) {
    		this.error("Session named '" + sessionName + "' not found.");
    		return false;
    	}
    	
    	var partic = new this.Participant();
    	partic.jid = to_jid;
    	partic.nickname = nick;
    	
    	// Need to queue this new participant up for making a call.
    	this.initQueue[/*TODO - create this with sessionname included: sessionName + "/" + */to_jid] = partic;
    	
    	self = this;
    	
    	// Construct the session-initiate and send it.
    	var req = $iq({'from': self.connection.jid, 'to': to_jid, 'type': 'set'})
    		.c('jingle', {'xmlns': Strophe.NS.WEBRTCCLIENT, 'action': 'session-initiate', 'initiator': self.connection.jid, 'responder' : to_jid, 'sid': sess.sid});
		
    	this.debug("request: " + req.toString());
    	this.debug(req);
    	
    	this.connection.sendIQ(req, function() {
        	// If we succeed, then we need to start a timer for killing this item from the queue
        	//   after the designated timeout (it means the other side never accepted nor refused)
        	// TODO - timeout mechanism. For now, we assume good behavior and no flakey connections.
    		partic.cb_accepted = cb_accepted;
    		partic.cb_rejected = cb_rejected;
    		
			self.info("initiateAdd completed to " + to_jid + " with result. Waiting for accept/reject.");
//			self.connection.addHandler(cb, Strophe.NS.JINGLE, 'iq', 'set', id, stanza.getAttribute('from'));
		}, function() {
	    	// If we fail, call the cb_error.
			self.error("initiateAdd failed to: " + to_jid);
			if (cb_error)
				cb_error(this);
		});

    },
});
    