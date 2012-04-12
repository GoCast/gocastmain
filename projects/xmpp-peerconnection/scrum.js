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

AddPlugin = function(nickname) {
	// TODO - FIX - Need a truly UNIQUE adder here - not nick which can change and be replaced during the lifetime of the call.
	$("#rtcobjects").append('<div id="div_GocastPlayer'+nickname+'"><object id="GocastPlayer'+nickname+'" type="application/x-gocastplayer" width="'+Callcast.WIDTH+'" height="'+Callcast.HEIGHT+'"></object></div>');
	
	return $('#GocastPlayer'+nickname).get(0);
};

RemovePlugin = function(nickname) {
	$("#div_GocastPlayer"+nickname).remove();
};

//
// Changing from document-ready to plugin-loaded for initialization items.
//
//$(document).ready(function () {
$(document).bind('plugin-initialized', function() {
	var jid = "";
	var password = "";

	console.log("trigger happened for plugin-initialized");
	
	if ($.getUrlVar('jid'))
		jid = $.getUrlVar('jid');
	if ($.getUrlVar('password'))
		password = $.getUrlVar('password');
		
	if ($.getUrlVar('nickname'))
		Callcast.SetNickname($.getUrlVar('nickname'));

	var bVideo = $('#video_enabled') && $('#video_enabled').is(':checked');
	Callcast.SetUseVideo(bVideo);
	
	//
	// Setup the callbacks needed for adding and removing the plugins as they come and go.
	//
	Callcast.setCallbackForAddPlugin(AddPlugin);
	Callcast.setCallbackForRemovePlugin(RemovePlugin);
	
	///
	/// Handle the login via URL which got passed or via dialog box.
	///
	if (jid != "" && password != "")
		Callcast.connect(jid, password);
	else if (jid === "anonymous")
		Callcast.connect(Callcast.CALLCAST_XMPPSERVER, "");	// Anonymous login.
	else
	{
	    $('#login_dialog').dialog({
	        autoOpen: true,
	        draggable: false,
	        modal: true,
	        title: 'Connect to XMPP',
	        buttons: {
	            "Connect": function () {
	            	if ($('#jid').val() === "anonymous" && $('#password')==="")
						Callcast.connect(Callcast.CALLCAST_XMPPSERVER, "");	// Anonymous login.
					else
		            	Callcast.connect($('#jid').val(), $('#password').val());
		            	
	                if ($('#nickname').val())
	                	Callcast.SetNickname($('#nickname').val());
	                	
	                $('#password').val('');
	                $(this).dialog('close');
	            }
	        }
	    });
	}
 
 	$('#video_enabled').click(function() {
		var bVideo = $(this).is(':checked');
		Callcast.SendLocalVideoToPeers(bVideo);
 	});
 	
 	$('#audio_muted').click(function() {
		var bMuteAudio = $(this).is(':checked');
		Callcast.MuteLocalVoice(bMuteAudio);
 	});
 	
	 $('#join_button').click(function () {
		 var sel =  $("#rooms option:selected");

		 if (sel !== "")
		 {
			 $('#participant-list').empty();
	    	 Callcast.JoinSession($(sel).text(), $(sel).attr('jid'));
		 }

	 });

	 $('#leave_button').click(function () {
		 if (!Callcast.joined)
			 alert("Not currently in session. Nothing to leave.");
		 else
		 {
			Callcast.LeaveSession();
		 	$('#participant-list').empty();
		 }
	 });
	 
	 $('#chat_text').keypress(function (ev) {
		if (ev.which === 13) {
			ev.preventDefault();

			var body = $(this).val();
			Callcast.SendPublicChat(body);
			
			$(this).val('');
		}
	 });

	 $('#send_chat').click(function() {
	 	var body = $('#chat_text').val();
	 	Callcast.SendPublicChat(body);
	 	$('chat_text').val('');
	 });
	 
	 $('#send_link').click(function() {
	    Callcast.SendSyncLink($('#link_text').val());
	 	$('#link_text').val('<sent>');
	 });

	 $('#get_roster_button').click(function () {
	 	Callcast.log("**NO_CODE_HERE** Getting user's roster...");
	 	
	 });
	
	 $('#subscribe_button').click(function () {
	 	Callcast.log("Subscription requested to " + $('#input').val() + "...");
	 	
	 	Callcast.connection.roster.subscribe($('#input').val());
	 });
	
	 $('#test_button').click(function() {
	 });
	 
	 $('#call_button').click(function () {
	
		 var to_whom = $('#to_whom').val();
		 var reason = $('#reason').val();
		 var room = $('#roomname').val().toLowerCase();
	
		 $('#participant-list').empty();
	
		 Callcast.MakeCall(to_whom, room, reason);
		 
	 });

});	// document ready


$(document).bind('joined_session', function () {
	 $('#leave_button').removeAttr('disabled');
	 $("#join_button").attr('disabled', 'disabled');
	 $("#rooms select").attr('disabled', 'disabled');

	 $('#send_chat').removeAttr('disabled');
	 $('#chat_text').removeAttr('disabled');

	 $('#send_link').removeAttr('disabled');
	 $('#link_text').removeAttr('disabled');
});

$(document).bind('left_session', function () {
	 $('#participant-list').empty();
	 $('#participant-list').append('<p>[None Yet]</p>');
	 
	 $("#leave_button").attr('disabled', 'disabled');
	 $('#join_button').removeAttr('disabled');
	 $('#rooms select').removeAttr('disabled');
	 
	 $('#send_chat').attr('disabled', 'disabled');
	 $('#chat_text').attr('disabled', 'disabled');
	 
	 $('#send_link').attr('disabled', 'disabled');
	 $('#link_text').attr('disabled', 'disabled');
});

$(document).bind('roomlist_updated', function () {
	 $('#rooms select').empty();
	 var room_added = false;
	 
	 for (k in Callcast.roomlist)
	 {
		 var optionline = '<option jid=' + k + ' room=' + Strophe.getNodeFromJid(k);
		 //
		 // If the room we're adding here is the same room we're already *IN*, then select it in the list.
		 //
		 if (Callcast.room === k)
			 optionline += ' selected=selected';
		 
		 optionline += '>' + Callcast.roomlist[k] + '</option>';
	
		 $('#rooms select').append(optionline);
		 room_added = true;
	 }
	 
	 if (!room_added)
		 $('#rooms select').append("<option>[None Yet]</option>");
});

$(document).bind('synclink', function (ev, link) {
	$('#link_text').val(link);
});

/*
Private and public chat inbound now create trigger callbacks…with json arguments.

For both:
- msginfo.nick = nickname
- msginfo.body = body of the message

For public-message only:
- msginfo.delayed    = if the message inbound is an old queued message, this is flagged so it 
                       can be treated differently by the UI.
- msginfo.action     = if a message comes from the ROOM and not from an individual, 
                       this is set for UI purposes.
- msginfo.nick_class = 'nick' if from someone else. and is = 'nick self' if it is a message 
                       which came from myself. All outbound messages wind up coming back as 
                       'nick self' messages from xmpp servers.
*/
$(document).bind('public-message', function(ev, msginfo) {
	var notice = msginfo.notice;
	var delayed = msginfo.delayed;
	var body = msginfo.body;
	var nick = msginfo.nick;
	var nick_class = msginfo.nick_class;
	
	if (!notice) {
		var delay_css = delayed ? " delayed" : "";

		var action = body.match(/\/me (.*)$/);
		if (!action) {
			add_message(
				"<div class='message" + delay_css + "'>" +
					"&lt;<span class='" + nick_class + "'>" +
					nick + "</span>&gt; <span class='body'>" +
					body + "</span></div>");
		} else {
			add_message(
				"<div class='message action " + delay_css + "'>" +
					"* " + nick + " " + action[1] + "</div>");
		}
	} else {
		add_message("<div class='notice'>*** " + body +
							"</div>");
	}
});

$(document).bind('private-message', function(ev, msginfo) {
	var body = msginfo.body;
	var nick = msginfo.nick;
	
	add_message(
		"<div class='message private'>" +
			"@@ &lt;<span class='nick'>" +
			"Private From " +
			nick + "</span>&gt; <span class='body'>" +
			body + "</span> @@</div>");
});

add_message = function (msg) {
	// detect if we are scrolled all the way down
	var chat = $('#chat').get(0);
	var at_bottom = chat.scrollTop >= chat.scrollHeight - 
		chat.clientHeight;
	
	$('#chat').append(msg);

	// if we were at the bottom, keep us at the bottom
	if (at_bottom) {
		chat.scrollTop = chat.scrollHeight;
	}
};

$(document).bind('user_joined', function (ev, info) {
	var nick = info.nick;
	var hasVid = info.hasVid;
	var joinstr = '<li nick="'+nick+'">' + nick;
	
	if (hasVid===null)
		joinstr += '</li>';
	else if (hasVid===true)
		joinstr += ' (Video On)</li>';
	else if (hasVid===false)
		joinstr += ' (Video Off)</li>';

	$('#participant-list').append(joinstr);
    Callcast.ShowRemoteVideo(info);
});

//
// UI section for being told that a user's status has changed.
// This means video was turned on or off.
// info.nick is the 'who' while info.hasVid tells the video
// status. NOTE: If info.hasVid is null, no video status is being
// reported by the other end. Otherwise it'll be true or false
// to indicate status.
//
// Also, Callcast.ShowRemoteVideo() is being called in order to
// make the UI pane disappear (0,0 size) if hasVid==false.
// If the caller wishes to set an actual width and height,
// all that is necessary is to set:
// info.width = <value1>
// info.height = <value2>
// prior to calling ShowRemoteVideo. This overrides info.hasVid
//
$(document).bind('user_updated', function (ev, info) {
	var nick = info.nick;
	var hasVid = info.hasVid;
	var nickstr = nick;
	
	if (hasVid===true)
		nickstr += ' (Video On)';
	else if (hasVid===false)
		nickstr += ' (Video Off)';

    $('#participant-list li').each(function () {
        if (nick === $(this).attr('nick')) {
            $(this).text(nickstr);
            Callcast.ShowRemoteVideo(info);
        }
    });
	
});

$(document).bind('user_left', function (ev, nick) {
    // remove from participants list
    $('#participant-list li').each(function () {
        if (nick === $(this).attr('nick')) {
            $(this).remove();
        }
    });
});

$(document).bind('room-creation-not-allowed', function(ev, roomname) {
	
	// Our system does not allow creating rooms. 
	// Joining a non-existent room is the same as trying to create a room.
	// This error occurs due to being disallowed of creating a room.
	// Likely the room used to exist but does not exist any longer.
	
	alert("Joining room '" + roomname + "' failed. Room may not exist.");
});

$(document).bind('connected', function () {

	$('.button').removeAttr('disabled');
	$('#rooms select').removeAttr('disabled');
	
/*	Callcast.connection.xmlInput = function(data) {
		if ($(data).children()[0])
			console.log("XML-IN:", $(data).children()[0]);
		else
			console.log("XML-IN:", $(data));
		
	};
	
	Callcast.connection.xmlOutput = function(data) {
		if ($(data).children()[0])
			console.log("XML-OUT:", $(data).children()[0]);
		else
			console.log("XML-OUT:", $(data));
		
	};
*/
	// Set "who am i" at the top
//	$("#myjid").text("My JID: " + Callcast.connection.jid);
	var vertext = "Plug-in Version: " + (Callcast.GetVersion() || "None");
	if (Callcast.pluginUpdateRequired())
		vertext += " -- Version update REQUIRED." + " Visit " + Callcast.PLUGIN_DOWNLOAD_URL;
	else if (Callcast.pluginUpdateAvailable())
		vertext += " -- Version update AVAILABLE." + " Visit " + Callcast.PLUGIN_DOWNLOAD_URL;
		
	$('#version').text(vertext);
	
   	Callcast.SendLocalVideoToPeers($('#video_enabled').is(':checked'));	// Update the video status locally upon signin.
	
});

$(document).bind('disconnected', function () {
 Callcast.log("Connection terminated.");

 $("#rooms select").empty();
 $("#rooms select").append("<li>[None Yet]</li>");
 $("#participant-list").empty();
 
 $("#leave_button").attr('disabled', 'disabled');
 $('#join_button').removeAttr('disabled');
 $('#rooms select').removeAttr('disabled');
 $('#myjid').html("<b>[Disconnected]</b>");

});

$(window).bind('beforeunload', function() {
	Callcast.disconnect();
});

$(window).unload(function() {
// After v1.15, no need to DeInit.	  Callcast.DeInitGocastPlayer();
	  Callcast.disconnect();
	});

function pluginLoaded() {
	console.log("Plugin loaded!");
	Callcast.InitGocastPlayer(null, null, function(message) {
		$(document).trigger('plugin-initialized');
	});
};
