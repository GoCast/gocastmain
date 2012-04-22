/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \file gocast-api.js
 *
 * \brief JavaScript code that implements the APIs for Gocast.it plug-in.
 *
 * \note This code reqires jQuery v1.7.2.
 *
 * \author Net-Scale Technologies, Inc.,
 *         <a href="http://www.net-scale.com">www.net-scale.com</a>\n
 *         Created April 15, 2012 (paula.muller@net-scale.com)
 *
 * Copyright (c) 2012 XVD. All rights reserved.
 */
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user joined the session.
 *        This is equivalent to trigger "joined_session" in scrum.js.
 */
function joinedSession(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  console.log(2, "User has successfully joined the session.");
  $('#leave_button').removeAttr('disabled');
  $("#join_button").attr('disabled', 'disabled');
  $("#rooms select").attr('disabled', 'disabled');

  $('#send_chat').removeAttr('disabled');
  $('#chat_text').removeAttr('disabled');

  $('#send_link').removeAttr('disabled');
  $('#link_text').removeAttr('disabled');
} /* joinedSession() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user left the session.
 *        This is equivalent to trigger "left_session" in scrum.js.
 */
function leftSession(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  console.log(2, "User has successfully left the session.");
  $('#participant-list').empty();
  $('#participant-list').append('<p>[None Yet]</p>');

  $("#leave_button").attr('disabled', 'disabled');
  $('#join_button').removeAttr('disabled');
  $('#rooms select').removeAttr('disabled');

  $('#send_chat').attr('disabled', 'disabled');
  $('#chat_text').attr('disabled', 'disabled');

  $('#send_link').attr('disabled', 'disabled');
  $('#link_text').attr('disabled', 'disabled');
  
} /* leftSession() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when room list has been updated.
 *        This is equivalent to trigger "roomlist_updated" in scrum.js.
 */
function roomListUpdate(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  console.log(2, "The room list has been updated.");
  $('#rooms select').empty();
  var room_added = false;

  for (k in Callcast.roomlist) {
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
  
} /* roomListUpdate() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a new sync link is issued.
 *        This is equivalent to trigger "synclink" in scrum.js.
 */
function syncLink(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Sync link. */
  link
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  console.log(2, "A new synclink has been issued.");
  $('#link_text').val(link);
  
} /* syncLink() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a public message arrives.
 *        This is equivalent to trigger "public_message" in scrum.js.
 */
function publicMessage(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Message Information Object. */
  msginfo
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var notice = msginfo.notice;
  var delayed = msginfo.delayed;
  var cont = msginfo.body;
  var nick = msginfo.nick;
  var nick_class = msginfo.nick_class;

  console.log(2, "A public message arrived.");
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
  
} /* publicMessage() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a private message arrives.
 *        This is equivalent to trigger "private_message" in scrum.js.
 */
function privateMessage(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Message Information Object. */
  msginfo
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var cont = msginfo.body;
  var nick = msginfo.nick;

  console.log(2, "A private message arrived.");
  add_message(
              "<div class='message private'>" +
              "@@ &lt;<span class='nick'>" +
              "Private From " +
              nick + "</span>&gt; <span class='body'>" +
              body + "</span> @@</div>");
  
} /* privateMessage() */
function add_message(msg) {
  // detect if we are scrolled all the way down
  var chat = $('#chat').get(0);
          var at_bottom = chat.scrollTop >= chat.scrollHeight -
            chat.clientHeight;

          $('#chat').append(msg);

          // if we were at the bottom, keep us at the bottom
          if (at_bottom) {
            chat.scrollTop = chat.scrollHeight;
          }
          
}


/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a new user joined.
 *        This is equivalent to trigger "user_joined" in scrum.js.
 */
function userJoined(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * User Information Object. */
  info
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var nick = info.nick;
  var hasVid = info.hasVid;
  
  console.log(2, "A new user joined.");
  var joinstr = '<li nick="'+nick+'">' + nick;

  if (hasVid===null)
    joinstr += '</li>';
  else if (hasVid===true)
    joinstr += ' (Video On)</li>';
  else if (hasVid===false)
    joinstr += ' (Video Off)</li>';

  $('#participant-list').append(joinstr);
  Callcast.ShowRemoteVideo(info);
  
} /* userJoined() */ 



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a user update its status.
 *        This is equivalent to trigger "user_updated" in scrum.js.
 */
function userUpdated(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * User Information Object. */
  info
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var nick = info.nick;
  var hasVid = info.hasVid;
  
  console.log(2, "User updated.");
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
  
} /* userUpdated() */ 



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a user left.
 *        This is equivalent to trigger "user_left" in scrum.js.
 */
function userLeft(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Nickname from user who left. */
  nick
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  console.log(2, "User " + nick + " left.");
  // remove from participants list
  $('#participant-list li').each(function () {
      if (nick === $(this).attr('nick')) {
        $(this).remove();
      }
    });
  
} /* userLeft() */ 



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when room creation was not allowed.
 *        This is equivalent to trigger "room-creation-not-allowed" in
 *        scrum.js.
 */
function roomCreationNotAllowed(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Room name. */
  roomname
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  alert("Joining room '" + roomname + "' failed. Room may not exist.");
  
  console.log(4, "The room creation was not allowed.");
  $("#errorMsgPlugin").empty();
  $("#errorMsgPlugin").append('<h1>Joining room ' + roomname+ ' failed</h1><p>Your room may not exist. Please reload and choose another room. [Ctrl + R]</p>');
  openWindow('#errorMsgPlugin');
} /* roomCreationNotAllowed() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user is connected.
 *        This is equivalent to trigger "connected" in scrum.js.
 */
function connected(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  console.log(2, "User is connected.");

  $('.button').removeAttr('disabled');
  $('#rooms select').removeAttr('disabled');
  var vertext = "Plug-in Version: " + (Callcast.GetVersion() || "None");
  if (Callcast.pluginUpdateRequired())
    vertext += " -- Version update REQUIRED." + " Visit " + Callcast.PLUGIN_DOWNLOAD_URL;
  else if (Callcast.pluginUpdateAvailable())
    vertext += " -- Version update AVAILABLE." + " Visit " + Callcast.PLUGIN_DOWNLOAD_URL;

  $('#version').text(vertext);
  Callcast.SendLocalVideoToPeers($('#video_enabled').is(':checked'));
  // Update the video status locally upon signin.
    
} /* connected() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user has disconnected.
 *        This is equivalent to trigger "disconnected" in scrum.js.
 */
function disconnected(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  console.log(2, "User has disconnected.");
  Callcast.log("Connection terminated.");

  $("#rooms select").empty();
  $("#rooms select").append("<li>[None Yet]</li>");
  $("#participant-list").empty();

  $("#leave_button").attr('disabled', 'disabled');
  $('#join_button').removeAttr('disabled');
  $('#rooms select').removeAttr('disabled');
  $('#myjid').html("<b>[Disconnected]</b>");
  
} /* disconnected() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that makes initializations associated to the local plugin.
 *        This makes some of the functionality from "plugin-initialized" in
 *        scrum.js
 */
function initializeLocalPlugin(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Callcast Seetings. */
  Callcast.SetNickname("Paula");
  Callcast.SetUseVideo(true); /* Initially set to true, user can disable. */
  /*
   * Connect anonymous. */
  Callcast.connect(Callcast.CALLCAST_XMPPSERVER, "");
  console.log(2, "initializeLocalPlugin complete.");
} /* initializeLocalPlugin() */

addPlugin = function(nickname) {
  // TODO - FIX - Need a truly UNIQUE adder here - not nick which can change and be replaced during the lifetime of the call.
  $("#rtcobjects").append('<div id="div_GocastPlayer'+nickname+'"><object id="\
GocastPlayer'+nickname+'" type="application/x-gocastplayer" width="'+Callcast.WIDTH+'" height="'+Callcast.HEIGHT+'"></object></div>');

  return $('#GocastPlayer'+nickname).get(0);
}

removePlugin = function(nickname) {
  $("#div_GocastPlayer"+nickname).remove();
}





/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when LOCAL Gocast.it plugin object is loaded.
 */
function pluginLoaded(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  console.log(2, "Local Plugin Loaded.");
  Callcast.localplayer = $("object.localplayer").get(0);
  Callcast.InitGocastPlayer(null, null, function(message) {
      /*
       * Initialization successful. */
      console.log(2, "Local plugin successfully initialized.");
      /*
       * Set callback functions to add and remove plugins for other
       * participants. */
      Callcast.setCallbackForAddPlugin(addPlugin);
      Callcast.setCallbackForRemovePlugin(removePlugin);     
      initializeLocalPlugin();
    }, function(message) {
      /*
       * Failure to initialize. */
      console.log(4, "Local plugin failed to initialize.");
      $("#errorMsgPlugin").empty();
      $("#errorMsgPlugin").append('<h1>Gocast.it plugin failed to initialize</h1><p>Please reload the page. [Ctrl + R]</p>');
      openWindow('#errorMsgPlugin');
    });
} /* pluginLoaded() */



$(document).ready(function () {

    $(window).bind('beforeunload', function() {
        Callcast.disconnect();
      });

    $(window).unload(function() {
        // After v1.15, no need to DeInit.        Callcast.DeInitGocastPlayer();
        Callcast.disconnect();
      });
    
    
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
    
  }) /* document.ready() */
