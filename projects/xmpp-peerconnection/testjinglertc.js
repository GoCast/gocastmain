
var Testjig = {
    connection: null,
//    peer_connection: null,
//    peer_connection_jid: null,

    escapeit: function(msg) {
   	    return msg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    },
    
    log: function (msg) {
 //   	var sel = $('#log');
 //   	sel.text(sel.text() + msg);
 //   	sel.append("<br>Ahem.&ltb&gtAnother-Bold&lt/b&gt");
    	$('#log').append(this.escapeit(msg) + "<br>");
    },

    infolog: function (msg) {
    	$('#info').text($('#info').text() + msg + "\n");
    },

    init: function() {
//    	this.peer_connection = document.getElementById('WebrtcPeerConnection');
//    	if (this.peer_connection === null)
//    		this.log("FAILED to create peer connection object.");
    	
//    	this.peer_connection.onlogmessage = this.log;

    },
    
    say_hello: function (to) {
    	var hi = $msg({ to: to, type: "chat" }).c("body").t("Hello there all you fine people.");
    	
    	Testjig.connection.send(hi);
    },
    
    handle_message: function(message) {
    	Testjig.log("RECEIVED CHAT: " + $(message).children('body').text());
    	
    	return true;
    },
    
    accepted: function(iq) {
    	Testjig.log("Got an accepted call.");
    },
    
    rejected: function(iq) {
    	Testjig.log("Call was rejected.");
    },
    
    initCallError: function(iq) {
    	Testjig.log("Initiating call resulted in an error.");
    },
    
    
 };

//
// Grab the url arguments and process/parse them into an array.
//
// Thanks to http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html for this.
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

$(document).ready(function () {
	var jid = "";
	var password = "";
	
	if ($.getUrlVar('jid'))
		jid = $.getUrlVar('jid');
	if ($.getUrlVar('password'))
		password = $.getUrlVar('password');
	
	if (jid != "" && password != "")
	{ 
		$(document).trigger('connect', { 
			jid: jid,
			password: password
		});
	}
	else
	{
	    $('#login_dialog').dialog({
	        autoOpen: true,
	        draggable: false,
	        modal: true,
	        title: 'Connect to XMPP',
	        buttons: {
	            "Connect": function () {
	                $(document).trigger('connect', {
	                    jid: $('#jid').val(),
	                    password: $('#password').val()
	                });
	                
	                $('#password').val('');
	                $(this).dialog('close');
	            }
	        }
	    });
	}
    
    $('#test_button').click(function () {
    	$.each(Testjig.connection.roster.contacts, function() {
    		Testjig.infolog(this.name + "-");
    		for (var k in this.resources)
    			Testjig.infolog("online resource=" + k);
    	});
    });

    $('#get_roster_button').click(function () {
    	Testjig.log("**NO_CODE_HERE** Getting user's roster...");
    	
    });

    $('#subscribe_button').click(function () {
    	Testjig.log("Subscription requested to " + $('#input').val() + "...");
    	
    	Testjig.connection.roster.subscribe($('#input').val());
    });

    $('#call_button').click(function () {
    	
    	Testjig.connection.sendIQ($iq({
    		from: Testjig.connection.jid,
    		to: $('#input').val(),
    		type: "set"
    	}).c("jingle", {xmlns: Strophe.NS.JINGLE, action: "session-initiate", 
    					initiator: Testjig.connection.jid, responder: $('#input').val(), 
    					sid: Testjig.connection.getUniqueId()}), function (datamsg) {
    		Testjig.log("1-OK callback: " + datamsg);
    	},
    	function(msg2) {
    		Testjig.log("1-Error callback: datamsg=" + msg2);
    	});
    	
    });

    $('#approve_call').dialog({
        autoOpen: false,
        draggable: false,
        modal: true,
        title: 'Incoming Call',
        buttons: {
            "Ignore": function () {
                Gab.connection.send($pres({
                    to: Gab.pending_subscriber,
                    "type": "unsubscribed"}));
                Gab.pending_subscriber = null;

                $(this).dialog('close');
            },

            "Answer/Accept": function () {
                Gab.connection.send($pres({
                    to: Gab.pending_subscriber,
                    "type": "subscribed"}));

                Gab.connection.send($pres({
                    to: Gab.pending_subscriber,
                    "type": "subscribe"}));

                Gab.pending_subscriber = null;

                $(this).dialog('close');
            }
        }
    });

    // Bind a click event to all the sub-lists and not the parents (for only online people)
      $("#roster li ul li").live("click", function(){
    	var jid = $(this).text();
 		Testjig.infolog("Calling " + jid);
 		Testjig.connection.webrtcclient.initiateAdd("test", jid, "Nickname", Testjig.accepted, Testjig.rejected, Testjig.initCallError );
    } );
    
});

$(document).bind('connect', function (ev, data) {
    var conn = new Strophe.Connection(
        "/xmpp-httpbind");

    conn.connect(data.jid, data.password, function (status) {
        if (status === Strophe.Status.CONNECTED) {
            $(document).trigger('connected');
        } else if (status === Strophe.Status.DISCONNECTED) {
            $(document).trigger('disconnected');
        }
    });

    $('.button').removeAttr('disabled');

    Testjig.connection = conn;
    Testjig.connection.webrtcclient.log = function(level, msg) {
    	console.log(msg);
    };
    Testjig.connection.webrtcclient.info("Info-Message-Test.");
});

$(document).bind('connected', function () {
    // inform the user
    Testjig.log("Test Logging is enabled.");
    Testjig.log("<b>This is a bold thing.</b>");
    Testjig.infolog("My full JID: " + Testjig.connection.jid);
    
    Testjig.connection.send($pres());

    // Handle inbound signaling messages
    Testjig.connection.addHandler(Testjig.handle_webrtc_message, null, "message", "webrtc-message");
    
});

$(document).bind('disconnected', function () {
    Testjig.log("Connection terminated.");

    // remove dead connection object
    Testjig.connection = null;
});

$(document).bind('roster_changed', function (ev, roster) {
    $('#roster').empty();

    var empty = true;
    $.each(roster.contacts, function (jid) {
        empty = false;

        var status = "offline";
        if (this.online()) {
            var away = true;
            for (var k in this.resources) {
                if (this.resources[k].show === "online") {
                    away = false;
                }
            }
            status = away ? "away" : "online";
        }

        var html = [];
        html.push("<div class='contact " + status + "'>");

        html.push("<li rosteritem=0>");
        
        if (status === "online")
        	html.push("(Online) ");
        
        html.push(this.name || jid);

        html.push(" - ");
        
        if (status === "online") {
        	// Create list of jid/resource, for the div.
        	html.push("<ul>");
        	for (var k in this.resources) {
        		html.push("<li>" + jid + "/" + k + "</li>");
        	}
        	
        	html.push("</ul>");
        }
        else {
            html.push(jid);
        }
        
        html.push("</li>");

        html.push("</div>");

        $('#roster').append(html.join(''));
    });

    if (empty) {
        $('#roster').append("<i>No contacts :(</i>");
    }
});
