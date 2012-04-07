/**
 * Server Bot - All-encompassing mechanism for listening/logging feedback
 *              as well as acting as the overseer of rooms to control the network.
 **/
var sys = require('util');
var xmpp = require('node-xmpp');
var argv = process.argv;

//if (argv.length != 4) {
//    sys.puts('Usage: node echo_bot.js <my-jid> <my-password>');
//    process.exit(1);
//}

function overseer(user, pw, rooms) {
	var self = this;
	var client = new xmpp.Client({ jid: user, password: pw });
	
	client.on('online', function() {
		// Need to join all rooms in 'rooms'
//		for k in rooms each ...
	});
	
	//
	// Now once we're online, we need to handle all incoming from each room.
	client.on('stanza', function(stanza) {
		if (stanza.is('message') && stanza.attrs.type !== 'error')
			self.handleMessage(stanza);
		if (stanza.is('presence') && stanza.attrs.type !== 'error')
			self.handlePresence(stanza);
		if (stanza.is('iq') && stanza.attrs.type !== 'error')
			self.handleIq(stanza);
	});

	client.on('error', function(e) {
		sys.puts(e);
	});
	
	var handleMessage = function(msg) {
	};
	
	var handlePresence = function(pres) {
	};
	
	var handleIq = function(iq) {
	};
};

var mucRoom = function(client) {
	if (!client)
	{
		alert("mucRoom() - No client specified.");
		return;
	}
	
	var join = function(roomname, nick) {
		client.send(new xmpp.Element('presence', {to: roomname + "/" + nick, usertype: 'silent'})
					.c('x', {xmlns: 'http://jabber.org/protocol/muc'}));
		
		// Once we get a response back...then we're 'joined' in the room.
		
	};
	
	var becomeOwner = function() {
		
	};
	
//  var create = function(
};

var feedbackBot = function(feedback_jid, feedback_pw) {
	// Login and then log any and all messages coming our way.
	// The clients should be sending:
	// Their jid, their room name, their nick
	// plus any message sent by the user.
	var client = new xmpp.Client({ jid: feedback_jid, password: feedback_pw });
	
	client.on('online',
		  function() {
		  client.send(new xmpp.Element('presence', { }).
			  c('show').t('chat').up().
			  c('status').t('Auto-Logging Feedback')
			 );
		  });
	client.on('stanza',
		  function(stanza) {
		  if (stanza.is('message') &&
			  // Important: never reply to errors!
			  stanza.attrs.type !== 'error') {
	
			  if (stanza.getChild('body'))
			  {
			  	var nick = stanza.attrs.nick || 'no-nick';
			  	var room = stanza.attrs.room || 'no-room';
			  	
				sys.puts("From: " + stanza.attrs.from
					+ ", Nick: " + nick
					+ ", Room: " + room
					+ ", Body: " + stanza.getChild('body').getText());
			  }
			  
			  // Swap addresses...
			  stanza.attrs.to = stanza.attrs.from;
			  delete stanza.attrs.from;
			  // and send back.
			  client.send(stanza);
		  }
		  });
	client.on('error',
		  function(e) {
		  sys.puts(e);
		  });
};

//
// Login as test feedback bot.
//
var fb = new feedbackBot("feedback_bot_test1@video.gocast.it", "test1");

//
// Login as Overseer
//
//var overseer = new overseer("overseer@video.gocast.it", "the.overseer.rocks", );

