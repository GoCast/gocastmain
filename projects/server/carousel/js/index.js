/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \file index.js
 *
 * \brief JavaScript code for Gocast.it plug-in.
 *
 * \note This code reqires jQuery v1.7.2.
 *
 * \author Net-Scale Technologies, Inc.,
 *         <a href="http://www.net-scale.com">www.net-scale.com</a>\n
 *         Created May 22, 2012 (paula.muller@net-scale.com)
 *
 * Copyright (c) 2012 XVD. All rights reserved.
 */
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/



/* global variables and objects */
/*++++++++++++++++++++++++++++++*/
/**
 * \brief The main application object.
 */
var app = {
  /**
   * Writes the specified log entry into the console HTML element, if
   * present. The meaning of logLevel is 1: debug, 2: info, 3:
   * warning, 4: error, 5: fatal. */
  log: function(logLevel, logMsg) {
    var labels = ["", "DEBUG", "INFO", "WARNING", "ERROR", "FATAL"];
    var now = new Date();
    var logText = now.toTimeString().split(" ")[0] + " " +
      labels[logLevel] + " " + logMsg;
    if (window.console) {
      console[["","log","info","warn","error","error"][logLevel]](logText);
    }
    /*
     * For fatal errors pop-up an alert in addition to the console log
     * entry but do it only once, to avoid flooding the user with alerts. */
    if (logLevel >= 5 && !app.logFatalReported) {
      var msg = "FATAL ERROR\n\n" + logMsg;
      alert(msg);
      app.logFatalReported = true;
    }
  }, /* app.log() */
  /**
   * Flag to remember if a fatal error was reported through a pop-up
   * alert previously so we can avoid pop-up flooding. */
  logFatalReported: false,
  /**
   * The browser object returned by getBrowser(). */
  browser: undefined,
  /**
   * Get the description of the browser and returns the browser object. */
  getBrowser: function() {
    var reVersion = new RegExp("(Chrome|Firefox|Mobile Safari|Safari)/" +
                               "([0-9]+).([0-9]+)", 'g');
    var matches = reVersion.exec(navigator.userAgent);
    if (!matches) {
      reVersion = new RegExp("(AppleWebKit)/([0-9]+).([0-9]+)", 'g');
      matches = reVersion.exec(navigator.userAgent);
    }
    app.browser = new Object();
    if (matches && matches[1]) {
      app.browser.name = matches[1];
    }
    if (matches && matches[2]) {
      app.browser.version = parseInt(matches[2]) || 0;
    }
    if (matches && matches[3]) {
      app.browser.subversion = parseInt(matches[3]) || 0;
    }
  }, /* app.getBrowser() */
  /**
   * Check correct browser version. */
  checkBrowser: function() {
    var expl = "Because this application uses advanced HTML5 features " +
      "it may not work correctly with this browser.";
    var recom = "Recommended browsers are Firefox 6+, Chrome 12+, and " +
      "Mobile Safari 525+.";
    var msg = undefined;
    switch (app.browser.name) {
    case "Chrome":
      if (app.browser.version < 12) {
        msg = "You appear to be using a Chrome version before 12. " +
          expl + " " + recom;
      }
      break;
    case "Firefox":
      if (app.browser.version < 6) {
        msg = "You appear to be using a Firefox version befor 6. " +
          expl + " " + recom;
      }
      break;
    case "Safari":
      if (app.browser.version < 525) {
        msg = "You appear to be using an older Safari version. " +
          expl + " " + recom;
      }
      break;
    case "Mobile Safari":
    case "AppleWebKit":
      if (app.browser.version < 525) {
        msg = "You appear to be using an older Mobile Safari version. " +
          expl + " " + recom;
      }
      break;
    default:
      msg = "We don't recognize your browser. " + expl + " " + recom;
      break;
    } /* switch (app.browser.name) */
    if (msg) {
      alert(msg);
    }
  }, /* app.checkBrowser() */
  /**
   * The OS platform. */
  osPlatform: (function(){
    var ua = navigator.userAgent.toLowerCase();
    return {
      isWin: /win/.test(ua),
      isMac: /mac/.test(ua),
      isLinux64: /linux x86_64/.test(ua),
      isLinux32: /linux i686/.test(ua)
    };
  }()),
  /**
   * Calculate number from string. */
  str2id: function(str) 
  {
    if (str)
    {
       var nn = 0;
       for (var i = 0; i < str.length; i++) 
       {
         nn += str.charCodeAt(i);
       }
       return nn;
    }
    else
    {
       app.log(4, "str2id str is null");
    }
  }, /* app.str2id() */
  /**
   * Check if gocast.it plugin is installed. */
  pluginInstalled: function() {
    var rtnFlag = false;
    $(navigator.plugins).each(function(i, e) {
      $(e).each(function(ii, ee) {
        if (ee.type &&
            ee.type.match("application/x-gocastplayer")) {
          rtnFlag = true;
          return rtnFlag;
        }
      });
    });
    return rtnFlag;
  }, /* app.pluginInstalled() */
  loggedInAll: function()
  {
     return app.xmppLoggedIn && app.userLoggedIn;
  },
  // logged in state
  xmppLoggedIn : false,
  userLoggedIn : false,
  // carousel controller instance
  carousel: null,
  /*
   * User Information. */
  user: {
    name: null,
    scheduleName: null,
    scheduleJid: null,
    scheduleTitle: null,
    fbProfileUrl: null,    // cache the url since user may log out of fb
    fbProfilePicUrl: null, // cache the url since user may log out of fb
    fbSkipped: false,      // user chose to skip fb login
  },
  // enable the audio video mute buttons, global chat input
  enableButtons: function(enable)
  {
     if (enable)
     {
        $("#meeting > #streams > #scontrols > input").removeAttr('disabled');
        $("#lower-right > #video").removeAttr('disabled');
        $("#lower-right > #audio").removeAttr('disabled');
        $("#msgBoard > input").removeAttr('disabled');
     }
     else
     {
        $("#meeting > #streams > #scontrols > input").attr('disabled', 'disabled');
        $("#lower-right > input.video").attr('disabled', 'disabled');
        $("#lower-right > input.audio").attr('disabled', 'disabled');
        $("#msgBoard > input").attr('disabled','disabled');
     } 
  },
  videoEnabled : false // video enabled state
}; /* app */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Populates carousel with demo content.
 */
function startDemoContent(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * First content. */
  // article is gone
  //Callcast.Callback_AddCarouselContent(new Object({id:"demo1", image:"url('images/demo1-egyptmap.gif')", altText:"Egyptians vote in first free presidential election", url:"http://www.google.com/hostednews/ap/article/ALeqM5iS0-q8BzFkHp3IV4ks-5tnbKnw-Q?docId=2b6df5e5e5fd40e0a8ab49103fda20bc"}));
  /*
   * Second content delayed 1000 ms. */
  setTimeout(function() {
    Callcast.Callback_AddCarouselContent(new Object({id:"demo2", image:"url('images/demo2-robertmoog.jpg')", altText:"Robert Moog: I would not call this music.", url:"http://www.guardian.co.uk/music/2012/may/23/robert-moog-interview-google-doodle"}));
  }, 1000);
  /*
   * Third content delayed 2000 ms. */
  setTimeout(function() {
    Callcast.Callback_AddCarouselContent(new Object({id:"demo3", image:"url('images/demo3-spaceX.png')", altText:"Launch of SpaceX Falcon 9", url:"http://www.youtube.com/embed/4vkqBfv8OMM"}));
  }, 2000);
  /*
   * Fourth content delayed 3000 ms. */
  setTimeout(function() {
    Callcast.Callback_AddCarouselContent(new Object({id:"demo4", image:"url('images/demo4-bawarriorsSF.jpg')", altText:"Warriors face many hurdles in building S.F. arena", url:"http://www.sfgate.com/cgi-bin/article.cgi?f=/c/a/2012/05/23/MNM41OLT8K.DTL"}));
  }, 3000);
  /*
   * Fifth content delayed 4000 ms. */
  setTimeout(function() {
    Callcast.Callback_AddCarouselContent(new Object({id:"demo5", image:"url('images/demo5-wikipedia.jpg')", altText:"Wikipedia", url:"http://www.wikipedia.org"}));
  }, 4000);
  closeWindow();
  return false;
} /* startDemoContent() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Open Personal Chat.
 */
function openPersonalChat(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Message Information Object. */
  msginfo
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Transition effect. */
  var jqMask = $('#mask');
  jqMask.fadeIn(500, activateWindow("#personalChat"));
  jqMask.fadeTo("fast", 0.3);
  /*
   * Set message. */
  var jqWin = $("#boxes > div#personalChat");
  $("p.msg", jqWin).text("").html(decodeURI(msginfo.body));
  /*
   * Set position based on nick id. */
  var id = app.str2id(msginfo.nick);
  var jqO = $('#meeting > #streams > #scarousel div#' + id);
  var cY = jqO.offset().top;
  var cX = jqO.offset().left;
  var winW = $(window).width();
  var winH = $(window).height();
  var wcW = jqWin.outerWidth();
  var wcH = jqWin.outerHeight();
  if ((cY + wcH) > winH) {
    jqWin.css("top", winH - wcH);
  }
  else {
    jqWin.css("top", cY);
  }
  if ((cX + wcW) > winW) {
    jqWin.css("left", winW - wcW);
  }
  else {
    jqWin.css("left", cX);
  }
  /*
   * Transition effect for Personal Chat Window.*/
  jqWin.fadeIn(700);
  /*
   * Add class active. */
  jqWin.addClass("active");
  return false;
} /* openPersonalChat() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief handle left mouse clock for carousel items.
 */
function carouselItemClick(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
   app.log(2, "carouselItemClick " + event);
   if (event.currentTarget.className.indexOf("unoccupied") != -1)
   {
      var urlName = prompt("Enter a URL to put in this spot.");
      if (urlName && urlName.length > 0)
      {
         //todo canonicalize url
         app.log(2, "carouselItemClick got url " + urlName);
         
         Callcast.SendURLToRender({
            id:      urlName,
            altText: urlName,
            url:     urlName,
            });
      }
   }
   else if (event.currentTarget.title === "Me")
   {
      // do nothing for now
   }
   else // remote user
   {
      openChat(event);
   }
   
} // carouselItemClick

///
/// \brief handle click on zoom button, zoom out spot
///
function carouselItemZoom(event)
{
   app.log(2, "carouselItemZoom ");
   event && event.stopPropagation();
   
   $('#meeting > #zoom').css("display", "block"); // display zoom div
   $('#meeting > #streams').css("height", "20%"); // unzoom carousel
   
   // get item and remove it from carousel
   var spot = $(event.currentTarget).parent();
   var item = $(spot).data('item');
   app.carousel.remove(item.index);
   
   $(spot).appendTo($('#meeting > #zoom')); // move div to zoom area
   $(spot).removeAttr('style');
   
   // style zoomed spot
   app.carousel.resize(); // update carousel
   resizeZoom();
   
} // carouselItemZoom

///
/// \brief handle click on zoom button, zoom out spot
///
function carouselItemUnzoom(event)
{
   app.log(2, "carouselItemUnzoom ");
   event && event.stopPropagation();
   
   $('#meeting > #zoom').css("display", "none"); // undisplay zoom div
   var spot = $('#meeting > #zoom > .cloudcarousel');
   app.carousel.insertSpot(spot); // put spot back in carousel
   $('#meeting > #streams').css("height", "100%"); // zoom carousel
   app.carousel.resize();
} // carouselItemUnzoom

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Open dialog with room description so user can copy to clipboard
 */
function openCopyData
(
  event
)
{
  if (!event)
  {
    return false;
  }
  
  // get the dialog
  var jqWin = $("#boxes > div#copyData");
  
  // set the room name
  var name = $('div#copyContent > #copyName', jqWin);

  $(name).text('Carousel room ' + $.getUrlVar('roomname'));
  $(name).attr("href", window.location.href);
  
  // position the dialog
  cX = event.clientX;
  cY = event.clientY;

  var winW = $(window).width();
  var winH = $(window).height();
  var wcW = jqWin.outerWidth();
  var wcH = jqWin.outerHeight();
  
  // todo parse css dimension and use it to place dlg
  //var marginRight = $(jqWin).css("margin-right");
  //var marginBottom = $(jqWin).css("margin-bottom");
  var marginRight = 20;
  var marginBottom = wcH/5 + 20;

  // move dialog up if past bottom
  if ((cY + wcH + marginBottom) > winH)
  {
    jqWin.css("top", winH - wcH - marginBottom);
  }
  else // place dialog at event location 
  {
    jqWin.css("top", cY);
  }
  
  // move dialog right if past right edge
  if ((cX + wcW + marginRight) > winW) 
  {
    jqWin.css("left", winW - wcW - marginRight);
  }
  else // place dialog at event location 
  {
    jqWin.css("left", cX);
  }
  
  // display dlg
  jqWin.fadeIn(700);
  jqWin.addClass("active");

  // set focus on message text input
  //$("input.chatTo", jqWin).focus();
  return false;
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Open Chat Input.
 */
function openChat(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (!event) {
    return false;
  }
  event.preventDefault();
  var cTarget, cX, cY;
  var jqWin = $("#boxes > div#chatInp");
  /*
   * Get target. */
  cTarget = event.currentTarget;
  if ($(cTarget).hasClass("feedback")) {
    $('span', jqWin).attr("id", "feedback").text("Feedback message:");
  }
  else if ($(cTarget).hasClass("typeContent")) {
    var url = $(cTarget).attr("url");
    window.open(url, '_blank', 'width=800,height=600');
    return false;
  }
  else {
    var recipientId = $(cTarget).attr("id");
    var recipient = $(cTarget).attr("title");
    var ename = $(cTarget).attr("encname");
    if (recipientId && recipientId.match("mystream")) {
      app.log(2, "Local player clicked, do nothing.");
      return false;
    }
    else if (recipientId) {
      $('span', jqWin).attr("id", recipientId).attr("ename", ename)
        .text("Message to " + recipient + ":");
    }
    else {
      return false;
    }
  }
  /*
   * Click position. */
  cX = event.clientX;
  cY = event.clientY;
  /*
   * Transition effect. */
  var jqMask = $('#mask');
  jqMask.fadeIn(500, activateWindow("#chatInp"));
  jqMask.fadeTo("fast", 0.3);
  /*
   * Position chat Inp. */
  var winW = $(window).width();
  var winH = $(window).height();
  var wcW = jqWin.outerWidth();
  var wcH = jqWin.outerHeight();
  if ((cY + wcH) > winH) {
    jqWin.css("top", winH - wcH);
  }
  else {
    jqWin.css("top", cY);
  }
  if ((cX + wcW) > winW) {
    jqWin.css("left", winW - wcW);
  }
  else {
    jqWin.css("left", cX);
  }
  /*
   * Transition effect for Chat Input Window.*/
  jqWin.fadeIn(700);
  /*
   * Add class active. */
  jqWin.addClass("active");
  /*
   * Add focus to input text. */
  $("input.chatTo", jqWin).focus();
  return false;
} /* openChat() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Open meeting room.
 */
function openMeeting(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "openMeeting");

  /*
   * Add encname attribute to mystream. */
  $("#meeting > #streams > #scarousel #mystream")
    .attr("encname", app.user.name);
    
  // use fb profile pick as bg image if it exists
  // set this here initially because local video
  // is off initially
  // todo consider moving this
  if (app.user.fbProfilePicUrl)
  {
     $("#meeting > #streams > #scarousel #mystream")
        .css("background-image", "url(" + app.user.fbProfilePicUrl + ")");
  }
  // center carousel in it's container
  // the carousel positioning is handled by it's resize method 
  var sCar = $("#scarousel");
  var rX = sCar.width() / 2;
  var rY = sCar.height() / 2;
  $("#scarousel").CloudCarousel(
    {
      xPos: rX,
      yPos: rY,
      xRadius: rX,
      yRadius: rY,
      buttonLeft: $("body > div#meeting > div#streams > div#scontrols > input.left"),
      buttonRight: $("body > div#meeting > div#streams > div#scontrols > input.right"),
      mouseWheel: true,
      minScale: 0.68
    }
  );
  // set the controller instance
  app.carousel = $("#scarousel").data('cloudcarousel');
  /*
   * Initialize Gocast events. */
  $(window).on('beforeunload', function() {
    app.log(2, "On before unload.");
    Callcast.LeaveSession();
  });
  /*/
  // test for leave session on page unload
  window.onbeforeunload = function() {
    app.log(2, "On before unload.");
    //alert("beforeunload");
    Callcast.LeaveSession();
    //return("Are you sure you want to navigate away from this page");
  };
  */
  $(window).unload(function() {
    app.log(2, "On unload.");
    //alert("unload");
 //RMW-TRY   Callcast.disconnect();
  });
  /*
   * Activate meeting window. */
  activateWindow("#meeting");
 /*
   * Hide window. */
  $('.window').hide();
  /*
   * Transition effect. */
  $('#mask').fadeOut(500);
  $('#meeting').fadeIn(1000);
  return false;
} /* openMeeting() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Keypress for name handler.
 */
function keypressNameHandler(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Remove any message. */
  $("#credentials2 > p.error").hide().text("");
  /*
   * We have no action for key press combinations with the Alt key. */
  if (event.altKey) {
    return;
  }
  /*
   * Plain key presses (no Alt or Ctrl key combinations). */
  if (!event.ctrlKey) {
    switch (event.which || event.keyCode) {
    case 13:                            /* 'Enter key' */
      app.log(2, "Enter key pressed");
      event.preventDefault();
      onJoinNow();
      break;
    } /* switch (event.which) */
  }
} /* keypressNameHandler() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Keypress for Chat handler.
 */
function keypressChatHandler(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * We have no action for key press combinations with the Alt key. */
  if (event.altKey) {
    return;
  }
  /*
   * Plain key presses (no Alt or Ctrl key combinations). */
  if (!event.ctrlKey) {
    switch (event.which || event.keyCode) {
    case 13:                            /* 'Enter key' */
      app.log(2, "Enter key pressed in chat handler");
      event.preventDefault();
      sendChat();
      break;
    } /* switch (event.which) */
  }
} /* keypressChatHandler() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action send Chat.
 */
function sendChat(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (event) {
    event.preventDefault();
  }
  var jqChatText = $('#chatInp > input.chatTo');
  var ltext = jqChatText.val();
  if (ltext.length < 1) {
    return false;
  }
  var jqChatSpan = $('#chatInp > span');
  var id = jqChatSpan.attr("id");
  if (id.length < 1) {
    app.log(4, "Error in chat, no id.");
  }
  else {
    if (id.match("group")) {
      Callcast.SendPublicChat(encodeURI(ltext));
    }
    else if (id.match("feedback")) {
      Callcast.SendFeedback(encodeURI(ltext));
    }
    else {
      var ename = jqChatSpan.attr("ename");
      Callcast.SendPrivateChat(encodeURI(ltext), ename);
    }
    app.log(2, "Sending chat to " + id);
    jqChatSpan.removeAttr("id");
    jqChatSpan.removeAttr("ename");
  }
  jqChatText.val('');
  closeWindow();
} /* sendChat() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Keypress for Group Chat handler.
 */
function keypressGrpChatHandler(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * We have no action for key press combinations with the Alt key. */
  if (event.altKey) {
    return;
  }
  /*
   * Plain key presses (no Alt or Ctrl key combinations). */
  if (!event.ctrlKey) {
    switch (event.which || event.keyCode) {
    case 13:                            /* 'Enter key' */
      app.log(2, "Enter key pressed in group chat handler");
      event.preventDefault();
      sendGrpChat();
      break;
    } /* switch (event.which) */
  }
} /* keypressGrpChatHandler() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action send Group Chat.
 */
function sendGrpChat(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (event) {
    event.preventDefault();
  }
  var jqChatText = $('#msgBoard > input.chatTo');
  var ltext = jqChatText.val();
  if (ltext.length < 1) {
    return false;
  }
  Callcast.SendPublicChat(encodeURI(ltext));
  app.log(2, "Sending group chat: " + ltext);
  jqChatText.val('');
  closeWindow();
} /* sendGrpChat() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action send Twitter message.
 */
function sendTwitter(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (event) {
    event.preventDefault();
  }
  alert("Sending message to Twitter will be coming soon.");
  app.log(2, "Sending message to Twitter: Not yet implemented");
  closeWindow();
} /* sendTwitter() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action change Video.
 */
function changeVideo()
{
  var jqObj = $('#lower-right > #video');
  if (!jqObj)
  {
     app.log(4, "couldn't find video button");
  }
  app.videoEnabled = $(jqObj).hasClass("on");
  var jqOo = $('#mystream');
  if (app.videoEnabled) {
    // Check object dimensions.
    var w = jqOo.width() - 4;
    var h = Callcast.HEIGHT * (w / Callcast.WIDTH);
    Callcast.SendLocalVideoToPeers(new Object({width:w, height:h}));
    // remove background image to prevent it from showing around the plugin
    // if there is no fb image leave the default bg image since it does not show through
    if (app.user.fbProfilePicUrl)
    {
       $(jqOo).css("background-image", "");
    }
  }
  else {
    Callcast.SendLocalVideoToPeers(app.videoEnabled);
    // show background image if fb image url exists
    // if not the default is used and does not show around the plugin
    if (app.user.fbProfilePicUrl)
    {
       $(jqOo).css("background-image", "url(" + app.user.fbProfilePicUrl + ")");
    }
  }
  $(jqObj).toggleClass("on");
  if (app.videoEnabled) {
    app.log(2, "Video turned on.");
    $(jqObj).attr("title", "Disable video");
  }
  else {
    app.log(2, "Video turned off.");
    $(jqObj).attr("title", "Enable video");
  }
  return false;
} /* changeVideo() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action change Audio.
 */
function changeAudio()
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var jqObj = $('#lower-right > #audio');
  if (!jqObj)
  {
     app.log(4, "couldn't find video button");
  }
  var bMuteAudio = $(jqObj).hasClass("off");
  Callcast.MuteLocalVoice(bMuteAudio);
  $(jqObj).toggleClass("off");
  if (bMuteAudio) {
    app.log(2, "Audio muted.");
    $(jqObj).attr("title", "Unmute audio");
  }
  else {
    app.log(2, "Audio unmuted.");
    $(jqObj).attr("title", "Mute audio");
  }
  return false;
} /* changeAudio() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Add event listeners to opened window.
 *
 *        Auxiliary function to customize features in different windows,
 *        and keep the open and close of modal window common.
 */
function activateWindow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Window Id with #. */
  winId
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (winId.match("credentials2")) {
    $("input#name", winId).on("keydown.s04072012", keypressNameHandler);
    $("input#btn", winId).on("click.s04072012", onJoinNow);
  }
  else if (winId.match("meeting")) {
    $('#lower-right > #video').on("click.s04172012a", changeVideo);
    $('#lower-right > #audio').on("click.s04172012b", changeAudio);
  }
  else if (winId.match("chatInp")) {
    $('input.chatTo', winId).on("keydown.s04172012g", keypressChatHandler);
    $('input.send', winId).on("click.s04172012g", sendChat);
  }
  return false;
} /* activateWindow() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Remove event listeners to opened window.
 *
 *        Auxiliary function to customize features in different windows,
 *        and keep the open and close of modal window common.
 */
function deactivateWindow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Window Id with #. */
  winId
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (winId.match("credentials2")) {
    /*
     * Remove any message. */
    $("p.error", winId).hide().text("");
    $("input#name", winId).off("keydown.s04072012", keypressNameHandler);
    $("input#btn", winId).off("click.s04072012", onJoinNow);
  }
  else if (winId.match("meeting")) {
    $('#lower-right > #video').off("click.s04172012a", changeVideo);
    $('#lower-right > #audio').off("click.s04172012b", changeAudio);

  }
  else if (winId.match("chatInp")) {
    $('input.chatTo', winId).off("keydown.s04172012g", keypressChatHandler);
    $('input.send', winId).off("click.s04172012g", sendChat);
  }
  return false;
} /* deactivateWindow() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Open modal window.
 */
function openWindow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Window Id with #. */
  winId
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Get window height and width. */
  var winH = $(window).height();
  var winW = $(window).width();
  /*
   * Set mask height and width to fill the whole screen. */
  var jqMask = $('#mask');
  jqMask.css({'width':winW,'height':winH});
  /*
   * Transition effect. */
  jqMask.fadeIn(1000, activateWindow(winId));
  jqMask.fadeTo("slow",0.8);
  /*
   * Center window. */
  var jqWin = $(winId);
  jqWin.css('top',  winH/2 - jqWin.height()/2);
  jqWin.css('left', winW/2 - jqWin.width()/2);
  /*
   * Transition effect.*/
  jqWin.fadeIn(2000);
  /*
   * Add class active. */
  jqWin.addClass("active");
  /*
   * Add focus to input name. */
  $("input#name", jqWin).focus();
  return false;
} /* openWindow() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Close modal window.
 */
function closeWindow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (event) {
    event.preventDefault();
  }
  /*
   * Get active window. */
  var jqActive = $('.window.active')
  if (jqActive[0]) {
    /*
     * Remove class active and call deactivate function. */
    jqActive.removeClass("active");
    deactivateWindow('#' + jqActive.attr("id"));
  }
  /*
   * Hide mask and window. */
  $('#mask').hide();
  $('.window').hide();
  return false;
} /* closeWindow() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Resize windows.
 */
function resizeWindows(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Get the window height and width. */
  var winH = $(window).height();
  var winW = $(window).width();
  /*
   * Set mask height and width to fill the whole screen. */
  $('#mask').css({'width':winW,'height':winH});
  /*
   * Update resizable windows. */
  $('#boxes .window.resizable').each(function(i, e) {
    $(e).css('top',  winH/2 - $(e).height()/2);
    $(e).css('left', winW/2 - $(e).width()/2);
  });
  /*
   * Update window #meeting. */
  var jqW = $('#meeting');
  var meetW = jqW.width();
  var meetOff = winW/2 - meetW/2;
  jqW.css('left', meetOff);
  
  // resize carousel
  if (app.carousel)
  {
     app.carousel.resize();
  }
  resizeZoom();
  return false;
} /* resizeWindows() */

///
/// \brief resize the zoom div and the spot in it
///
function resizeZoom(event)
{
   var width =  $('#meeting > #zoom').width();
   var height = $('#meeting > #zoom').height();
   var jqDiv = $('#meeting > #zoom > .cloudcarousel');
   var item = $(jqDiv).data('item');
   var newWidth  = width * 1.0; //app.carousel.options.xSpotRatio;
   var newHeight = height * 1.0; //app.carousel.options.ySpotRatio;
   var widthScale =  newWidth  / item.orgWidth;
   var heightScale = newHeight / item.orgHeight;
   var scale = (widthScale < heightScale) ? widthScale : heightScale;
   item.orgWidth     *= scale;
   item.orgHeight    *= scale;
   item.plgOrgWidth  *= scale
   item.plgOrgHeight *= scale

   // center div in zoom div
   var left = (width - item.orgWidth) / 2;
   var top  = (height - item.orgHeight) / 2;
   
   $(jqDiv).css('width',  item.orgWidth  + 'px');
   $(jqDiv).css('height', item.orgHeight + 'px');
   $(jqDiv).css('left',   left + 'px');
   $(jqDiv).css('top',    top  + 'px');
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief callback for login button press.
 */
function onJoinNow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
    app.log(2, "onJoinNow");

    // get the nick name, return back to dialog if not defined
    var usrNm = $("#credentials2 > input#name").val();
    
    // user must enter fb or nick name if both not entered
    // display error
    if (usrNm.length < 1) {
      $("#credentials2 > p.error").text("Please enter a name to continue.").
        fadeIn("fast");
      return false;
    }
    
    // set app name from dialog text field
    app.user.name = encodeURI(usrNm);
    Callcast.SetNickname(app.user.name); // TODO should be somewhere else
    app.log(2, "User name:" + usrNm);
    
    // close dialog
    deactivateWindow("#credentials2");

    app.userLoggedIn = true;
    $(document).trigger("one-login-complete", "OnJoinNow() -- non-FB-login");

} /* onJoinNow() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief callback for fb skip button press
 */
function enterId(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
    app.log(2, "enterId");
    deactivateWindow("#credentials");
    $('.window').hide();
    //closeWindow();
    openWindow('#credentials2');
} /* onJoinNow() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief check login credential and display login dialog if necessary.
 */
function checkCredentials(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
    app.log(2, "checkCredentials");
    
    // this method is called on a fb status change
    // so do nothing if we're already logged in
    if (app.userLoggedIn)
    {
       return;
    }

    // check fb login status and prompt if not skipped and not logged in
    if (!app.user.fbSkipped && !FB.getAuthResponse())
    {
       openWindow('#credentials');
    }
    else // fb logged in update fb logged in status
    {
      deactivateWindow("#credentials");
      app.userLoggedIn = true;
      $(document).trigger("one-login-complete", "checkCredentials - FB Login");
    }
} /* checkCredentials() */

//
// If there is a specific room listed in the URL, then create/join that room.
//
// If there is no room specified, then we need to ask the server to create a random
// room name and we'll join that room.
//
function handleRoomSetup() {
	app.log(2, "handleRoomSetup entered");
	var room_to_create = $.getUrlVar("roomname") || "";

	room_to_create = room_to_create.replace(/ /g, '');
    app.log(2, "room_to_create " + room_to_create);

	Callcast.CreateUnlistedAndJoin(room_to_create, function(new_name) {
		// We successfully created the room.
		// Joining is in process now.
		// trigger of joined_room will happen upon join complete.
		
		app.user.scheduleName = "Place to meet up";
		app.user.scheduleJid = new_name + Callcast.AT_CALLCAST_ROOMS;
		app.user.scheduleTitle = "Open room";

		app.log(2, "Room named '" + new_name + "' has been created. Joining now.");
		app.log(2, "window.location " + window.location);
		if (room_to_create.length < 1)
		{
		   var newUrl = window.location + "?roomname=" + new_name
   		   app.log(2, "replacing state " + newUrl);
		   history.replaceState(null, null, newUrl);
		}
	});
};

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief check if plugin installed and prompt user if not
 */
function tryPluginInstall(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "tryPluginInstall");
  /*
   * check plugin installed. */
  if (app.pluginInstalled()) {
    /*
     * Close buttons. */
    $('.window .close').on("click", closeWindow);
    /*
     * Resize window. */
    $(window).resize(resizeWindows);
  }
  else {
    /*
     * Alert user to download and install the plugin. */
    if (app.osPlatform.isWin) {
      $("#errorMsgPlugin > p > a#dlLink").attr("href","javascript:closeWindow();openWindow('#winEula');void(null);");
    }
    else if (app.osPlatform.isMac) {
      $("#errorMsgPlugin > p > a#dlLink").attr("href","https://video.gocast.it/downloads/GoCastPlayer.pkg");
    }
    else if (app.osPlatform.isLinux64 || app.osPlatform.isLinux32) {
      $("#errorMsgPlugin").css("height", 300);
      if (app.osPlatform.isLinux64) {
        $("#errorMsgPlugin > p > a#dlLink").attr("href","https://video.gocast.it/downloads/GoCastPlayer_x86_64.tar.gz");
      }
      else {
        $("#errorMsgPlugin > p > a#dlLink").attr("href","https://video.gocast.it/downloads/GoCastPlayer_i686.tar.gz");
      }
      $("#errorMsgPlugin > p > a#dlLink").parent().find("span").addClass("hidden");
      $("#errorMsgPlugin > .linuxExplanation").removeClass("hidden");
    }
    else {
      $("#errorMsgPlugin > p > a#dlLink").parent().text("We are sorry. We couldn't identify your OS.")
    }
    openWindow('#errorMsgPlugin');
  }
} /* tryPluginInstall() */

///
/// \brief close the eula window, download the win install file, launch function to check for plugin
///
function winInstall(event)
{
   // close the eula window
   closeWindow();
   
   // get the windows install file
   $.post("https://video.gocast.it/downloads/GoCastPlayer.msi",
          function(data)
          {
             console.log(data);
          });

   openWindow("#winWait");         
   winCheckForPlugin();
}

///
/// \brief periodically check for the player to be installed and prompt user
///
function winCheckForPlugin()
{
   // find player
   for (i = 0; i < window.navigator.plugins.length; ++i)
   {
      var item = window.navigator.plugins[i];
      //app.log(2, 'plugin filename ' + item.filename);
      if (item && item.filename === 'npGCP.dll')
      {
         clearTimeout(app.winTimeout);
         app.log(2, "winCheckForPlugin found player.");
         $('#winWait > #status > #spinner').attr("src", "images/green-tick.png");
         $('#winWait > #status > #msg').text("The GoCast plugin is installed.");
         
         // display error msg after a timeout in case the plugin does not load
         app.winTimeout = setTimeout(winPluginPunt, 10000);
         return; // we're done since the plugin is in the list
      }
   }
   
   // plugin was not found in list wait and recheck
   app.winTimeout = setTimeout(winCheckForPlugin, 3000);
   app.log(2, "winCheckForPlugin no player, waiting...");
}

///
/// \brief display a message to restart the browser
///
/// the pluginLoaded callback should close the winWait dialog
/// if it doesn't prompt user to restart the browser
///
function winPluginPunt()
{
   $('#winWait > #status > #spinner').attr("src", "images/red-x.png");
   $('#winWait > #status > #msg').text("Hmmm... looks like the plugin did not load.  Please restart the browser");
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief show the chat output div
 *
 * this is called on ticker mouse over
 */
function showChatOut()
{

   if ($('#msgBoard > #chatOut').text().length > 0)
   {
      // hide the ticker
      $('#msgTicker').css("display", "none");
   
      // show chatOut
      $('#msgBoard > #chatOut').css("display", "block");
   }
   
} // showChatOut

/**
 * \brief show the chat ticker div
 *
 */
function showMsgTicker()
{
   // hide the ticker
   $('#msgBoard > #chatOut').css("display", "none");
   
   // show chatOut
   $('#msgTicker').css("display", "block");
   
} // showChatOut

///
/// \brief initialize ui handlers
///
function docKey(event)
{
   /// no ctrl-<key> accelerators
   if (event.ctrlKey)
   {
      return;
   }
   app.log(2, "key code " + event.which);
   
   switch (event.which || event.keyCode) 
   {
     case 32: // space bar
       //changeAudio();
       break;
     case 65: // alt-a, toggle audio
       if (event.altKey)
       {
          changeAudio();
       }
       break;
     case 86: // alt-v, toggle video
       if (event.altKey)
       {
          changeVideo();
       }
       break;
     case 67: // c key, chat input
       if (event.altKey)
       {
          // set focus to global chat input
          event.preventDefault();
          $('#msgBoard > input.chatTo').focus();
       }
       break;
     case 37: // left arrow, scroll carousel left
        if (app.carousel)
        {
           app.carousel.rotate(1);
        }
       break;
     case 39: // right arrow, scroll carousel right
        if (app.carousel)
        {
           app.carousel.rotate(-1);
        }
       break;
   }
}

///
/// \brief initialize ui handlers
///
function uiInit()
{
   // add global keyboard accelerators
   //$('meeting').keypress(meetingKey);
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief The document ready event handler.
 *
 * This event handler is called right after the DOM finishes loading.
 */
$(document).ready(function(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  // Check the browser.
  app.getBrowser();
  app.checkBrowser();

  // login callback
  $(document).bind('checkCredentials', checkCredentials);

  $(document).keydown(docKey); // global key handler
  
  fbInit(); // init facebook api
  
  // Login to xmpp anonymously
  Callcast.connect(Callcast.CALLCAST_XMPPSERVER, "");

  // Write greeting into console.
  app.log(2, "Page loaded.");
  
}); // $(document).ready(function())

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

