/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \file callcast-api.js
 *
 * \brief JavaScript code that implements the APIs for Gocast.it plug-in.
 *
 * \note This code reqires jQuery v1.7.2.
 *
 * \author Net-Scale Technologies, Inc.,
 *         <a href="http://www.net-scale.com">www.net-scale.com</a>\n
 *         Created May 21, 2012 (paula.muller@net-scale.com)
 *
 * Copyright (c) 2012 XVD. All rights reserved.
 */
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user joined the session.
 *        This implements the trigger "joined_session".
 */
$(document).on('joined_session', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User has successfully joined the session.");
  /*
   * Enable button activities except join. */
  app.enableButtons(true);
  closeWindow();
  
  //todo put openmeeting here to load plugin earlier
  
  return false;
}); /* joined_session() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user left the session.
 *        This implements the trigger "left_session".
 */
$(document).on('left_session', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User has successfully left the session.");
  /*
   * Remove all the objects in carousel. */
  $("#meeting > #streams > #scarousel div.cloudcarousel:not(.unoccupied)").each(function(i, e) {
    if ($(e).hasClass("typeContent")) {
      removeContentFromCarousel($(e).attr("encname"));
    }
    else {
      removePluginFromCarousel($(e).attr("encname"));
    }
  });
  /*
   * Disable button activities except join. */
  app.enableButtons(false);
  return false;
}); /* left_session() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when room list has been updated.
 *        This implemets the trigger "roomlist_updated".
 */
$(document).on('roomlist_updated', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "The room list has been updated.");
}); /* roomlist_updated() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a new sync link is issued.
 *        This implements the trigger "synclink".
 */
$(document).on('synclink', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * Sync link. */
  link
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "A new synclink has been issued.");
}); /* synclink() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a public message arrives.
 *        This implements the trigger "public-message".
 */
$(document).on('public-message', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * Message Information Object. */
  msginfo
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var notice = msginfo.notice;
  var delayed = msginfo.delayed;
  var nick_class = msginfo.nick_class;

  /*
   * Add message to Message Board. */
  var jqChat = $("#msgBoard > #chatOut");
  var jqTick = $("#msgBoard > #msgTicker");
  var msg = '<b>'+ decodeURI(msginfo.nick) +'</b>'+': '+
                   decodeURI(msginfo.body) + "<br>";
  jqChat.append(msg);
  var msgTicker = '<b>'+ decodeURI(msginfo.nick) +'</b>'+': '+
                   decodeURI(msginfo.body) + " ";
  jqTick.prepend(msgTicker);

  app.log(2, "A public message arrived " + msg);
}); /* public-message() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a private message arrives.
 *        This implements the trigger "private-message".
 */
$(document).on('private-message', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * Message Information Object. */
  msginfo
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  openPersonalChat(msginfo);
  app.log(2, "A private message arrived.");
}); /* private-message() */

///
/// extract spot info from info object 
/// and set participant info
/// the image participant property is in css format url(<url>)
///
function setSpotInfo(info)
{
    if (info && info.nick)
    {
       var spot = Callcast.participants[info.nick];
       if (spot)
       {
          if (info.image)
          {
             spot.image = "url(" + info.image + ")";
          }
          else // use the default bg image
          {
             spot.image = 'url(images/person.png)';
          }
       }
       app.log(2, "setSpotInfo nick " + info.nick + " image " + info.image);
       console.log("setSpotInfo", info, spot);
    }
}

///
/// set the carousel video based on the callcast participant state
/// for an occupied spot
///
function setCarouselItemState(info)
{
try
{
  if (info && info.nick)
  {
    var id = app.str2id(info.nick);
    var oo = $("#meeting > #streams > #scarousel div.#"+id).get(0);
    if (oo)
    {  // item found
       // Check dimensions of wrapper div to correct for video dimensions.
       if (info.hasVid) {
           var w = $(oo).width() - 4;
           var s = w / Callcast.WIDTH;
           var h = Callcast.HEIGHT * s;
           info.width = w;
           info.height = h;
           app.log(2, "setCarouselItemState video on user dim w "+info.width+", h "+info.height);
           $(oo).css("background-image", ''); // remove any background image
           Callcast.ShowRemoteVideo(info);
       }
       else // if hasVid is null or false turn video off
       {
          info.hasVid = false;
          var image = Callcast.participants[info.nick].image;
          $(oo).css("background-image", image);
          Callcast.ShowRemoteVideo(info);
          app.log(2, "setCarouselItemState video off image " + image);
       }
    }
    else
    {
       //app.log(3, "setCarouselItemState item for " + info.nick + " not found");
    }
  }
}
catch (err)
{
   console.log("setCarouselItemState exception", err);
}
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a new user joined.
 *        This is implements the trigger "user_joined".
 */
$(document).on('user_joined', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * User Information Object. */
  info
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  // get nickname and find carousel item 
  // carousel item for this user was created in addplugin...
  app.log(2, "A new user " + info.nick + " joined.");
  setSpotInfo(info); // set the item data
  setCarouselItemState(info); // set the carousel video state
}); /* user_joined() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a user update its status.
 *        This implemets the trigger "user_updated'.
 */
$(document).on('user_updated', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * User Information Object. */
  info
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  // get nickname and find carousel item 
  // carousel item for this user was created in addplugin...
  app.log(2, "user " + info.nick + " updated.");
  setSpotInfo(info); // set the item data
  setCarouselItemState(info); // set the carousel video state
}); /* user_updated() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a user left.
 *        This implements the trigger "user_left".
 */
$(document).on('user_left', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * Nickname from user who left. */
  nick
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User " + nick + " left.");
}); /* user_left() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when room creation was not allowed.
 *        This implements the trigger "room-creation-not-allowed".
 */
$(document).on('room-creation-not-allowed', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * Room name. */
  roomname
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(4, "The room creation was not allowed.");
  $("#errorMsgPlugin").empty();
  $("#errorMsgPlugin").append('<h1>Joining room ' + roomname+ ' failed</h1><p>Your room may not exist. Please reload and choose another room. [Ctrl + R]</p>');
  openWindow('#errorMsgPlugin');
}); /* room-creation-not-allowed() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user is connected.
 *        This implements the trigger "connected".
 */
$(document).on('connected', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User is connected.");

  /* debug
// Inside $(document).bind('connected'), function() { ....

Callcast.connection.xmlInput = function(data) {
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
   
  /*
   * Open waiting room in case it takes too long to join. */
  openWindow("#waitingToJoin");

  app.xmppLoggedIn = true;
  
  $(document).trigger("one-login-complete", "XMPP GO.");		// One more login action complete.
  return false;
}); /* connected() */

$(document).on("one-login-complete", function(event, msg) {

	if (msg)
		console.log("one-login-complete: Msg: " + msg);
	else
		console.log("one-login-complete: No Msg");
	
	if (app.loggedInAll())
	{
		console.log("one-login-complete: opening meeting");
	    openMeeting();

        // check, install plugin
        tryPluginInstall();

	}

});

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user has disconnected.
 *        This implements the trigger "disconnected".
 */
$(document).on('disconnected', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User has disconnected.");
  Callcast.log("Connection terminated.");
  return false;
}); /* disconnected() */



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
  var vertext = "Plug-in Version: " + (Callcast.GetVersion() || "None");
  if (Callcast.pluginUpdateRequired()) {
    vertext += " -- Version update REQUIRED." + " Visit " +
      Callcast.PLUGIN_DOWNLOAD_URL;
    /*
     * Force user to update plugin. */
    app.log(4, "Plugin update required: " + vertext);
    $("#errorMsgPlugin").empty();
    $("#errorMsgPlugin").append('<h1>Gocast.it plugin version update required</h1><p>Please visit <a href=' + Callcast.PLUGIN_DOWNLOAD_URL + '>' + Callcast.PLUGIN_DOWNLOAD_URL + '</a> to reinstall.</p>');
    openWindow('#errorMsgPlugin');
    return false;
  }
  else if (Callcast.pluginUpdateAvailable()) {
    vertext += " -- Version update AVAILABLE." + " Visit " +
      Callcast.PLUGIN_DOWNLOAD_URL;
  }
  app.log(2, vertext);

  /*
   * Callcast Seetings. */
  Callcast.SetUseVideo(false); /* Initially set to false, user must enable. */
  app.log(2, "initializeLocalPlugin complete.");
} /* initializeLocalPlugin() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when other Gocast.it plugin object is created.
 */
function addPluginToCarousel(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Other user nick name. */
  nickname
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var dispname = decodeURI(nickname);
  var id = app.str2id(nickname);
  /*
   * Check next available cloudcarousel. */
  var oo = $("#meeting > #streams > #scarousel div.unoccupied").get(0);
  if (oo) {
    $(oo).attr("id", id);
    $(oo).attr("encname", nickname);
    $(oo).attr("title", dispname);
    /*
     * Get dimensions oo and scale plugin accordingly. */
    var w = Math.floor($(oo).width() - 4);
    var h = Math.floor((w / Callcast.WIDTH) * Callcast.HEIGHT);
    $(oo).append('<object id="GocastPlayer'+id+'" type="application/x-gocastplayer" width="' + w + '" height="' + h +'"></object>');
    $("div.name", oo).text(dispname);
    $(oo).removeClass("unoccupied");

    app.log(2, "Added GocastPlayer" + id + " object.");
    return $("object#GocastPlayer" + id, oo).get(0);
  }
  else {
    app.log(4, "Maximum number of participants reached.");
  }
} /* addPluginToCarousel() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when other Gocast.it plugin object is removed.
 */
function removePluginFromCarousel(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Other user nick name. */
  nickname
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Get parent object and modify accordingly. */
  var id = app.str2id(nickname);
  var jqOo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id + '"');
  jqOo.addClass("unoccupied");
  jqOo.removeAttr("title");
  jqOo.removeAttr("id");
  jqOo.removeAttr("encname");
  /*
   * Remove player. */
  jqOo.empty();
  /*
   * Add name placeholder. */
  jqOo.append('<div class="name"></div>');
  jqOo.css("background-image", 'url("images/gologo.png")'); // reset background image
  return false;
} /* removePluginFromCarousel() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when content is added to carousel.
 */
function addContentToCarousel(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Info json object with id, image, altText and url. */
  info
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "addContentToCarousel " + info.id);
  console.log("info", info);
  
  // info.id is an encoded name, get an id from it to use to index 
  // into carousel items
  var id = app.str2id(info.id);
  
  oo = $("#meeting > #streams > #scarousel div.unoccupied").get(0);
  if (oo) {
    $(oo).attr("id", id);
    $(oo).attr("title", info.altText);
    $(oo).attr("alt", info.altText);
    $(oo).attr("url", info.url);
    $(oo).attr("encname", info.id);
    $(oo).removeClass("unoccupied").addClass("typeContent");

    // use the image in info if supplied
    // else generate one from the url
    if (info.image)
    {
       $(oo).css("background-image", info.image);
    }
    else // gen image from url
    {
       GoCastJS.getUrlInfo(
       { 
         webUrl:   info.url,
         proxyUrl: "http://carousel.gocast.it/proxy",
       }, 
       function(urlInfo)
       {
          // remove the spot background
          $(oo).css("background-image", "");
          // create a child div with url info for spot
          var divIcon = $('<div class="spotUrlIcon"/>');
          // hot link to http://getfavicon.appspot.com/ to get favicon
          $(divIcon).css("background-image", 'url(http://g.etfv.co/' + info.url + ')');
          
          var divTitle = $('<div class="spotUrlTitle"/>');
          // add title
          if (urlInfo.title)
          {
             $(divTitle).append($('<p>' + urlInfo.title + '</p>'));
          }
          else 
          {          
             $(divTitle).append($('<p>' + info.url + '</p>'));
          }
          $(oo).append('<div class="urlPad"/>');
          $(oo).append(divIcon);
          $(oo).append(divTitle);
       });
    }
    app.log(2, "Added Content" + id + " object.");
  }
  else {
    app.log(4, "Maximum number of participants reached.");
  }
} /* addContentToCarousel() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when other content from carousel is removed.
 */
function removeContentFromCarousel(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Id of content to remove. */
  infoId
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Get parent object and modify accordingly. */
  var id = app.str2id(infoId);
  var jqOo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id + '"');
  jqOo.addClass("unoccupied").removeClass("typeContent");
  jqOo.removeAttr("id");
  jqOo.removeAttr("title");
  jqOo.removeAttr("alt");
  jqOo.removeAttr("url");
  jqOo.removeAttr("encname");
  jqOo.css("background-image", 'url("images/gologo.png")');
  return false;
} /* removeContentFromCarousel() */

///
/// \brief addspot callback, forward spot add to carousel
///
function addSpot(info)
{
   console.log("addSpot", info);
   app.carousel.addSpotCb(info);
}

///
/// \brief removespot callback forward to carousel
///
function removeSpot(info)
{
   console.log("removeSpot", info);
   app.carousel.removeSpotCb(info);
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
  app.log(2, "Local Plugin Loaded.");
  Callcast.localplayer = $("#mystream > object.localplayer").get(0);
  Callcast.InitGocastPlayer(null, null, function(message) {
    /*
     * Initialization successful. */
    app.log(2, "Local plugin successfully initialized.");
    /*
     * Set callback functions to add and remove plugins for other
     * participants and content. */
    Callcast.setCallbackForAddPlugin(addPluginToCarousel);
    Callcast.setCallbackForRemovePlugin(removePluginFromCarousel);
    Callcast.setCallbackForAddCarouselContent(addContentToCarousel);
    Callcast.setCallbackForRemoveCarouselContent(removeContentFromCarousel);
    Callcast.setCallbackForAddSpot(addSpot);
    Callcast.setCallbackForRemoveSpot(removeSpot);
    initializeLocalPlugin();
					
    handleRoomSetup();
  }, function(message) {
    /*
     * Failure to initialize. */
    app.log(4, "Local plugin failed to initialize.");
    $("#errorMsgPlugin").empty();
    $("#errorMsgPlugin").append('<h1>Gocast.it plugin failed to initialize</h1><p>Please reload the page. [Ctrl + R]</p>');
    openWindow('#errorMsgPlugin');
  });
} /* pluginLoaded() */
