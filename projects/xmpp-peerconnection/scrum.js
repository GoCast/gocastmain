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
