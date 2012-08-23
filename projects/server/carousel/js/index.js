/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/ /**
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

/*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */
/*global Callcast, ActiveXObject, swfobject, FB, fbInit, removeSpotCb */
// todo refactor below
/*global
  keypressNameHandler,
  onJoinNow,
  changeVideo,
  changeAudio,
  keypressChatHandler,
  sendChat,
  openChat,
  resizeZoom,
  closeWindow,
  sendPersonalChat,
  sendGrpChat,
  closeWindow,
  installPrompt,
  checkForPlugin,
  connectionStatus
*/
'use strict';


/* global variables and objects */
/*++++++++++++++++++++++++++++++*/
/**
 * \brief The main application object.
 */
var app = {
  GROUP_CHAT_OUT: '#lower-left > #msgBoard > #chatOut',
  GROUP_CHAT_IN: '#lower-left > #msgBoard > input.chatTo',
  MAC_DL_URL: 'https://video.gocast.it/downloads/GoCastPlayer.pkg',
  WIN_DL_URL: 'https://video.gocast.it/downloads/GoCastPlayer.msi',
  LIN_64_DL_URL: 'https://video.gocast.it/downloads/GoCastPlayer_x86_64.tar.gz',
  LIN_32_DL_URL: 'https://video.gocast.it/downloads/GoCastPlayer_i686.tar.gz',
  MAC_PL_NAME: 'GCP.plugin',
  WIN_PL_NAME: 'npGCP.dll',
  STATUS_PROMPT: "#upper-right > #status-prompt",
  STATUS_PROMPT_STOP: "#upper-right > #status-prompt > #stop-showing",
  spotUrDefaultClass: "control close", // the class for #upper-right image for unoccupied spot
  spotUrDefaultImage: "images/trash.png",
  /**
   * Writes the specified log entry into the console HTML element, if
   * present. The meaning of logLevel is 1: debug, 2: info, 3:
   * warning, 4: error, 5: fatal. */
  log: function(logLevel, logMsg) {
    var labels = ['', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'FATAL'],
        now = new Date(),
        logText = now.toTimeString().split(' ')[0] + ' ' + labels[logLevel] + ' ' + logMsg,
        msg;
    if (window.console) {
      console[['', 'log', 'info', 'warn', 'error', 'error'][logLevel]](logText);
    }
    /*
     * For fatal errors pop-up an alert in addition to the console log
     * entry but do it only once, to avoid flooding the user with alerts. */
    if (logLevel >= 5 && !app.logFatalReported) {
      msg = 'FATAL ERROR\n\n' + logMsg;
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
    var reVersion = new RegExp('(Chrome|Firefox|Mobile Safari|Safari)/' +
                               '([0-9]+).([0-9]+)', 'g'),
        matches = reVersion.exec(navigator.userAgent);
    if (!matches) {
      reVersion = new RegExp('(AppleWebKit)/([0-9]+).([0-9]+)', 'g');
      matches = reVersion.exec(navigator.userAgent);
    }
    app.browser = {};
    if (matches && matches[1]) {
      app.browser.name = matches[1];
    }
    if (matches && matches[2]) {
      app.browser.version = parseInt(matches[2], 10) || 0;
    }
    if (matches && matches[3]) {
      app.browser.subversion = parseInt(matches[3], 10) || 0;
    }
  }, /* app.getBrowser() */
  /**
   * Check correct browser version. */
  checkBrowser: function() {
    var expl = 'Because this application uses advanced HTML5 features ' + 'it may not work correctly with this browser.',
        recom = 'Recommended browsers are Firefox 6+, Chrome 12+, and ' + 'Mobile Safari 525+.',
        msg;
    switch (app.browser.name) {
    case 'Chrome':
      if (app.browser.version < 12) {
        msg = 'You appear to be using a Chrome version before 12. ' +
          expl + ' ' + recom;
      }
      break;
    case 'Firefox':
      if (app.browser.version < 6) {
        msg = 'You appear to be using a Firefox version befor 6. ' +
          expl + ' ' + recom;
      }
      break;
    case 'Safari':
      msg = "Sorry we don't support the Safari browser right now.\nPlease use Chrome or Firefox for now.";
      /*
      if (app.browser.version < 525) {
        msg = 'You appear to be using an older Safari version. ' +
          expl + ' ' + recom;
      }
      */
      break;
    case 'Mobile Safari':
    case 'AppleWebKit':
      if (app.browser.version < 525) {
        msg = 'You appear to be using an older Mobile Safari version. ' +
          expl + ' ' + recom;
      }
      break;
    default:
      msg = "We don't recognize your browser. " + expl + ' ' + recom;
      break;
    } /* switch (app.browser.name) */
    if (msg) {
      alert(msg);
    }
  }, /* app.checkBrowser() */
  /**
   * The OS platform. */
  osPlatform: (function() {
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
       var nn = 0, i;
       for (i = 0; i < str.length; i += 1)
       {
         nn += str.charCodeAt(i);
       }
       return nn;
    }
    else
    {
       app.log(4, 'str2id str is null');
    }
  }, /* app.str2id() */
  /**
   * Check if gocast.it plugin is installed. */
  pluginInstalled: function() {
    var rtnFlag = false,
        object;
    if ($.browser.msie)
    {
       try
       {
          object = new ActiveXObject('GoCast.GCP');
          rtnFlag = true;
       }
       catch (err) {} // do nothing on exception
    }
    else // not IE
    {
       $(navigator.plugins).each(function(i, e) {
         $(e).each(function(ii, ee) {
           if (ee.type &&
               ee.type.match('application/x-gocastplayer')) {
             rtnFlag = true;
             return rtnFlag;
           }
         });
       });
    }
    console.log("app.pluginInstalled ", rtnFlag);
    return rtnFlag;
  }, /* app.pluginInstalled() */
  loggedInAll: function()
  {
     return app.xmppLoggedIn && app.userLoggedIn;
  },
  // logged in and loaded state
  xmppLoggedIn: false,
  userLoggedIn: false,
  pluginLoaded: false,
  pluginUpgrade: false,
  volWarningDisplayed: false, // set to true when vol warning display code executes, it may or may not the warning depending on the cookie
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
    fbSkipped: false      // user chose to skip fb login
  },
  // enable the audio video mute buttons, global chat input
  enableButtons: function(enable)
  {
     if (enable)
     {
        $('#meeting > #streams > #scontrols > input').removeAttr('disabled');
        $('#lower-right > #video').removeAttr('disabled');
        $('#lower-right > #audio').removeAttr('disabled');
        $(app.GROUP_CHAT_OUT).removeAttr('disabled');
     }
     else
     {
        $('#meeting > #streams > #scontrols > input').attr('disabled', 'disabled');
        $('#lower-right > input.video').attr('disabled', 'disabled');
        $('#lower-right > input.audio').attr('disabled', 'disabled');
        $(app.GROUP_CHAT_OUT).attr('disabled', 'disabled');
     }
  },
  videoEnabled: true // video enabled state todo this must be initially in sync with video button class
                     //       make either this var or button class the state variable
}; /* app */

///
/// \brief global spot close handler, see defect 14
///
function onSpotClose(event)
{
  var spot = $(event.currentTarget).parent(),
      item = spot.data('item');

  console.log("onSpotClose", event);

  if (item.spotnumber){
    Callcast.RemoveSpot({spotnumber: item.spotnumber || item.index});
  } else {
    removeSpotCb({spotnumber: item.index});
  }

  event.stopPropagation();
}
///
/// \brief showChat in spot
///
function showPersonalChatWithSpot(spot)
{
  var item = $(spot).data('item');

  console.log("showPersonalChat");
  $("#showChat", item.object).css("display", "none"); // hide showChat button
  $("#msgBoard", item.object).css("display", "block"); // show chat ui
  //$("#msgBoard > input.chatTo", item.object).focus(); // todo consider setting focus if no other input has focus
}
///
/// \brief global handler for showChat spot button press
///
function showPersonalChat(event)
{
  var spot = $(event.currentTarget).parent();
  showPersonalChatWithSpot(spot.get(0));
  $("#msgBoard > input.chatTo", spot).focus();
}

///
/// \brief global handler for close personal chat
///
function closePersonalChat(event)
{
  var msgBoard = $(event.currentTarget).parent(),
      spot = msgBoard.parent(),
      item = spot.data('item');

  console.log("closePersonalChat", event);
  $("#showChat", item.object).css("display", "block"); // hide showChat button
  $("#msgBoard", item.object).css("display", "none"); // show chat ui
  event.stopPropagation();
}

function loadVideo(oo, info)
{
  var item, playerId, width, height, params, atts;
  //if (oo && info && info.spotDivId)
  if (oo && info && info.spotdivid)
  {
    item = $(oo).data('item');
    item.spotInfo = info; // save info so youtube player callback can get ytid vid id from it

    //$(oo).attr('id', info.spotDivId);
    $(oo).attr('id', info.spotdivid);
    $(oo).removeClass('unoccupied')
         .addClass('typeContent')
         .addClass('videoContent');
    // create div to be replace by swf player
    //var playerId = info.spotDivId + '-player';
    playerId = info.spotdivid + '-player';
    $(oo).append('<div id=' + playerId + '></div>');
    width = $(oo).width();
    height = $(oo).height();
    // see http://code.google.com/p/swfobject/wiki/api
    // https://developers.google.com/youtube/js_api_reference
    // https://code.google.com/apis/ajax/playground/?exp=youtube#chromeless_player
    params = { allowScriptAccess: 'always' }; // Lets Flash from another domain call JavaScript
    atts = { id: playerId };                // The element id of the Flash embed
    swfobject.embedSWF(
       'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=' + playerId, // url
       playerId, // div replace by embed
       width,
       height,
       '9', // flash version
       null, // express install url
       null, // flashvars
       params, // params
       atts  // atts
    );
  }
  else
  {
     app.log(5, 'loadVideo error div ' + oo + ' info ' + info);
     console.log('div', oo);
     console.log('info', info);
  }
}
///
/// \brief This function is automatically called by the player once it loads
///
/// 'LyWnvAWEbWE' // mit medical mirror
/// 'GAHZSW1XOCU' // woman vlog thunderbird
/// 'ZAvL3j3hOCU' // youtube is a conference
/// 'AkfvND215No' // open u interview
/// 'BW44KXIu7Q8' // Daphne Koller coursera interview
function onYouTubePlayerReady(playerId)
{
  var spotDiv, item, arr, ytplayer;
  try
  {
     ytplayer = document.getElementById(playerId);
     if (!ytplayer) {
       throw 'ytplayer not found';
     }
     spotDiv = $(ytplayer).parent();
     if (spotDiv.length === 0) {
       throw 'ytplayer parentnot found';
     }
     item = spotDiv.data('item');
     if (!item) {
       throw 'item not found';
     }
     if (!item.spotInfo.ytid) {
       throw 'item.ytid not found';
     }
     console.log('onYouTubePlayerReady playerId ' + playerId + ' ytVideoId ' + item.spotInfo.ytid);
     arr = [item.spotInfo.ytid];
     ytplayer.loadPlaylist({playlist: arr,
                            index: 0,
                            startSeconds: 0,
                            suggestedQuality: 'small'});
     ytplayer.setLoop(true);
     ytplayer.mute();
  }
  catch (err)
  {
     app.log(4, 'onYouTubePlayerReady ' + err);
  }
}

///
/// \brief add demo video's to n spots
///
function startVideoContent()
{
  app.log(2, 'startVideoContent');
  setTimeout(function()
  {
    Callcast.AddSpot({spotReplace: 'first-unoc', spotNodup: 1, spotType: 'youtube',
                      ytid: 'ZAvL3j3hOCU', // youtube is a conference
                      spotDivId: 'demo-video-1'
                      });
  }, 1000);
  setTimeout(function()
  {
    Callcast.AddSpot({spotReplace: 'last-unoc', spotNodup: 1, spotType: 'youtube',
                      ytid: 'BW44KXIu7Q8', // Daphne Koller coursera interview
                      spotDivId: 'demo-video-2'
                      });
  }, 1000);
  return false;
} // startVideoContent()

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
  if (winId.match('credentials2')) {
    $('input#name', winId).on('keydown.s04072012', keypressNameHandler);
    $('input#btn', winId).on('click.s04072012', onJoinNow);
  }
  else if (winId.match('meeting')) {
    $('#lower-right > #video').on('click.s04172012a', changeVideo);
    $('#lower-right > #audio').on('click.s04172012b', changeAudio);
  }
  else if (winId.match('chatInp')) {
    $('input.chatTo', winId).on('keydown.s04172012g', keypressChatHandler);
    $('input.send', winId).on('click.s04172012g', sendChat);
  }
  return false;
} /* activateWindow() */

///
/// \brief Open Personal Chat.
///
function openPersonalChat(
  msginfo      // Message Information Object.
)
{
  /*
   * Transition effect. */
  var jqMask = $('#mask'),
      jqWin, id, jqO, cY, cX, winW, winH,
      wcW, wcH,
      item;
  /*
   * Set position based on nick id. */
  id = app.str2id(msginfo.nick);
  jqO = $('#meeting > #streams > #scarousel div#' + id);

  if (jqO.length === 0 && msginfo.nick === "overseer") // from user not found, check if overseer
  {
      item = app.carousel.getItem(1);
      if (!item)
      {
        return;
      }
      jqO = $(item.object);
  }
  jqMask.fadeIn(500, activateWindow('#personalChat'));
  jqMask.fadeTo('fast', 0.3);
  /*
   * Set message. */
  jqWin = $('#boxes > div#personalChat');
  $('p.msg', jqWin).text('').html(decodeURI(msginfo.body));
  cY = jqO.offset().top;
  cX = jqO.offset().left;
  winW = $(window).width();
  winH = $(window).height();
  wcW = jqWin.outerWidth();
  wcH = jqWin.outerHeight();
  if ((cY + wcH) > winH) {
    jqWin.css('top', winH - wcH);
  }
  else {
    jqWin.css('top', cY);
  }
  if ((cX + wcW) > winW) {
    jqWin.css('left', winW - wcW);
  }
  else {
    jqWin.css('left', cX);
  }
  /*
   * Transition effect for Personal Chat Window.*/
  jqWin.fadeIn(700);
  /*
   * Add class active. */
  jqWin.addClass('active');
  return false;
} /* openPersonalChat() */

///
/// \brief handle left mouse clock for carousel items.
///
function carouselItemClick(event)
{
  try
  {
    var urlName,
        item;
    console.log('carouselItemClick ', event);
    //todo add a class for remote video spots
    if (event.currentTarget.className.indexOf('unoccupied') !== -1)
    {
      // do nothing
    }
    else if (event.currentTarget.title === 'Me')
    {
      // do nothing for now
    }
    else // remote user
    {
      //openChat(event); //todo refactor doesn't open chat anymore, opens feedback or url spot
    }
  } catch(err) {
    app.log(4, "carouselItemClick exception " + err);
  }
} // carouselItemClick

///
/// \brief handle click on zoom button, zoom out spot
///
function carouselItemZoom(event)
{
   app.log(2, 'carouselItemZoom ');
   if (event) {
      event.stopPropagation();
   }

   // do nothing if there's a zoomed spot
   if ($('#meeting > #zoom > .cloudcarousel').length > 0)
   {
      return;
   }

   $('#meeting > #zoom').css('display', 'block'); // display zoom div
   $('#meeting > #streams').css('height', '20%'); // unzoom carousel

   // get item and remove it from carousel
   var spot = $(event.currentTarget).parent(),
       item = $(spot).data('item');
   app.carousel.remove(item.index);

   $(spot).appendTo($('#meeting > #zoom')); // move div to zoom area, doesn't work with local, remote video spot
   //$('#meeting > #zoom')[0].appendChild(spot[0]); // move div to zoom area, doesn't work with local, remote video spot

   app.carousel.resize(); // update carousel
   resizeZoom();

} // carouselItemZoom

///
/// \brief handle click on zoom button, zoom out spot
///
function carouselItemUnzoom(event)
{
   app.log(2, 'carouselItemUnzoom ');
   if (event) {
     event.stopPropagation();
   }

   $('#meeting > #zoom').css('display', 'none'); // undisplay zoom div
   var spot = $('#meeting > #zoom > .cloudcarousel');
   app.carousel.insertSpot(spot); // put spot back in carousel
   $('#meeting > #streams').css('height', '100%'); // zoom carousel
   app.carousel.resize();
} // carouselItemUnzoom

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Open dialog with room description so user can copy to clipboard
 */
function openCopyData(event)
{
  if (!event)
  {
    return false;
  }

  // get the dialog
  var jqWin = $('#boxes > div#copyData'),
  // set the room name
      name = $('div#copyContent > #copyName', jqWin),
      cX, cY, winW, winH, wcW, wcH,
      marginRight, marginBottom;

  $(name).text('Carousel room ' + $.getUrlVar('roomname'));
  $(name).attr('href', window.location.href);

  // position the dialog
  cX = event.clientX;
  cY = event.clientY;

  winW = $(window).width();
  winH = $(window).height();
  wcW = jqWin.outerWidth();
  wcH = jqWin.outerHeight();

  // todo parse css dimension and use it to place dlg
  //var marginRight = $(jqWin).css("margin-right");
  //var marginBottom = $(jqWin).css("margin-bottom");
  marginRight = 20;
  marginBottom = wcH / 5 + 20;

  // move dialog up if past bottom
  if ((cY + wcH + marginBottom) > winH)
  {
    jqWin.css('top', winH - wcH - marginBottom);
  }
  else // place dialog at event location
  {
    jqWin.css('top', cY);
  }

  // move dialog right if past right edge
  if ((cX + wcW + marginRight) > winW)
  {
    jqWin.css('left', winW - wcW - marginRight);
  }
  else // place dialog at event location
  {
    jqWin.css('left', cX);
  }

  // display dlg
  jqWin.fadeIn(700);
  jqWin.addClass('active');

  return false;
}

///
/// \brief Open Chat Input.
/// todo refactor
///
function openChat(event)
{
  if (!event) {
    return false;
  }
  event.preventDefault();
  var cTarget, cX, cY,
      jqWin = $('#boxes > div#chatInp'),
      url, recipientId, recipient, ename,
      jqMask, winW, winH, wcH, wcW;
  /*
   * Get target. */
  cTarget = event.currentTarget;
  if ($(cTarget).hasClass('feedback')) {
    $('span', jqWin).attr('id', 'feedback').text('Feedback message:');
  }
  else if ($(cTarget).hasClass('typeContent')) {
    url = $(cTarget).attr('url');
    if (url.length > 0)
    {
      window.open(url, '_blank', 'width=800,height=600');
    }
    return false;
  }
  // Click position.
  cX = event.clientX;
  cY = event.clientY;
  // Transition effect.
  jqMask = $('#mask');
  jqMask.fadeIn(500, activateWindow('#chatInp'));
  jqMask.fadeTo('fast', 0.3);
  // Position chat Inp.
  winW = $(window).width();
  winH = $(window).height();
  wcW = jqWin.outerWidth();
  wcH = jqWin.outerHeight();
  if ((cY + wcH) > winH) {
    jqWin.css('top', winH - wcH);
  }
  else {
    jqWin.css('top', cY);
  }
  if ((cX + wcW) > winW) {
    jqWin.css('left', winW - wcW);
  }
  else {
    jqWin.css('left', cX);
  }
  // Transition effect for Chat Input Window.
  jqWin.fadeIn(700);
  // Add class active.
  jqWin.addClass('active');
  // Add focus to input text.
  $('input.chatTo', jqWin).focus();
  return false;
} // openChat()

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
  app.log(2, 'openMeeting');

  /*
   * Add encname attribute to mystream. */
  $('#meeting > #streams > #scarousel #mystream')
    .attr('encname', app.user.name);

  // use fb profile pick as bg image if it exists
  // set this here initially because local video
  // is off initially
  /* todo below needs to be uncommented if initial video state is off
          rewrite the video on/off background on/off code
  if (app.user.fbProfilePicUrl)
  {
     $('#meeting > #streams > #scarousel #mystream')
        .css('background-image', 'url(' + app.user.fbProfilePicUrl + ')');
  }
  */
  // center carousel in it's container
  // the carousel positioning is handled by it's resize method
  var sCar = $('#scarousel'),
      rX = sCar.width() / 2,
      rY = sCar.height() / 2;
  $('#scarousel').CloudCarousel(
    {
      xPos: rX,
      yPos: rY,
      xRadius: rX,
      yRadius: rY,
      buttonLeft: $('body > div#meeting > div#streams > div#scontrols > input.left'),
      buttonRight: $('body > div#meeting > div#streams > div#scontrols > input.right'),
      mouseWheel: true,
      minScale: 0.68
    }
  );
  // set the controller instance
  app.carousel = $('#scarousel').data('cloudcarousel');
  app.carousel.init();
  /*
   * Initialize Gocast events. */
  $(window).on('beforeunload', function() {
    app.log(2, 'On before unload.');
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
    app.log(2, 'On unload.');
    //alert("unload");
 //RMW-TRY   Callcast.disconnect();
  });
  /*
   * Activate meeting window. */
  activateWindow('#meeting');
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
  $('#credentials2 > p.login-error').hide().text('');
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
      app.log(2, 'Enter key pressed');
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
      app.log(2, 'Enter key pressed in chat handler');
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
  var jqChatText = $('#chatInp > input.chatTo'),
      ltext = jqChatText.val(),
      jqChatSpan, id, ename;
  if (ltext.length < 1) {
    return false;
  }
  jqChatSpan = $('#chatInp > span');
  id = jqChatSpan.attr('id');
  if (id.length < 1) {
    app.log(4, 'Error in chat, no id.');
  }
  else {
    if (id.match('group')) {
      Callcast.SendPublicChat(encodeURI(ltext));
    }
    else if (id.match('feedback')) {
      Callcast.SendFeedback(encodeURI(ltext));
    }
    else {
      ename = jqChatSpan.attr('ename');
      Callcast.SendPrivateChat(encodeURI(ltext), ename);
    }
    app.log(2, 'Sending chat to ' + id + " " + ltext);
    jqChatSpan.removeAttr('id');
    jqChatSpan.removeAttr('ename');
  }
  jqChatText.val('');
  closeWindow();
} /* sendChat() */

///
/// \brief spot personal chat text input keypress handler
///
function keypressPersonalChatHandler(event)
{
  event.stopPropagation();
  //app.log(2, 'keypressPersonalChatHandler');

  /// We have no action for key press combinations with the Alt key.
  if (event.altKey) {
    return;
  }
  // Plain key presses (no Alt or Ctrl key combinations).
  if (!event.ctrlKey) {
    switch (event.which || event.keyCode) {
    case 13:                            /* 'Enter key' */
      app.log(2, 'Enter key pressed in personal chat handler');
      event.preventDefault();
      sendPersonalChat(event);
      break;
    } // switch (event.which)
  }
}

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
  event.stopPropagation();
  app.log(2, 'keypressGrpChatHandler');
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
      app.log(2, 'Enter key pressed in group chat handler');
      event.preventDefault();
      sendGrpChat();
      break;
    } /* switch (event.which) */
  }
} /* keypressGrpChatHandler() */

///
/// \brief Action send Group Chat.
///
function sendGrpChat(event)
{
  if (event) {
    event.preventDefault();
  }
  var jqChatText = $(app.GROUP_CHAT_IN),
      ltext = jqChatText.val();
  if (ltext.length < 1) {
    return false;
  }
  Callcast.SendPublicChat(encodeURI(ltext));
  app.log(2, 'Sending group chat: ' + ltext);
  jqChatText.val('');
  closeWindow();
} // sendGrpChat()

///
/// \brief Action send personal chat
///
function sendPersonalChat(event)
{
  try
  {
    // div.cloudcarousel > div.msgBoard > input.send handler
    //var spot = $(event.currentTarget).parent().parent(), // doesnt work returns input element
    //    text = $("#msgBoard > input.chatTo", spot).val(),
    //    name = spot.attr("ename");
    var spot, msg, text, name, jqIn, jqOut, util;
    event.stopPropagation();
    msg = event.currentTarget.parentElement;
    spot = msg.parentElement;
    jqIn = $("input.chatTo", msg);
    jqOut = $("div#chatOut", msg);
    text = jqIn.val();
    name = $(spot).attr("encname");
    console.log("sendPersonalChat text " + text + " name " + name, event);
    if (text.length > 0) {
      util = jqOut.data('util');
      if (!util) {throw "no chat util";}
      msg = '<b>me</b>: ' + text;
      util.addMsg(msg);
      Callcast.SendPrivateChat(encodeURI(text), name);
      jqIn.val("");
    }
    jqIn.focus();
  } catch (err) {
    app.log(4, "sendPersonalChat exception " +  err);
  }
} // sendPersonalChat()

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
  alert('Sending message to Twitter will be coming soon.');
  app.log(2, 'Sending message to Twitter: Not yet implemented');
  closeWindow();
} /* sendTwitter() */

///
/// \brief status div stop checkbox handler
///
function stopStatusClicked(event)
{
   var checked = $(app.STATUS_PROMPT_STOP).attr("checked");
   console.log("stopStatusChecked", checked);
   $.cookie("stopVolumeStatus", checked);
}
///
/// \brief status div close handler
///
function closeStatus(event)
{
   $(app.STATUS_PROMPT).css("display", "none");
}
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action change Video.
 */
function changeVideo()
{
  var jqObj = $('#lower-right > #video'),
      jqOo = $('#mystream'),
      w, h;
  if (!jqObj)
  {
     app.log(4, "couldn't find video button");
  }
  if (!jqOo)
  {
     app.log(4, "couldn't find local video spot");
  }
  $(jqObj).toggleClass('on');
  app.videoEnabled = $(jqObj).hasClass('on');
  console.log("changeVideo", app.video);
  if (app.videoEnabled) {
    // Check object dimensions.
    w = jqOo.width() - 4;
    h = Callcast.HEIGHT * (w / Callcast.WIDTH);
    Callcast.SendLocalVideoToPeers({width: w, height: h});
    // remove background image to prevent it from showing around the plugin
    // if there is no fb image leave the default bg image since it does not show through
    if (app.user.fbProfilePicUrl)
    {
       $(jqOo).css('background-image', '');
    }
  }
  else {
    Callcast.SendLocalVideoToPeers(app.videoEnabled);
    // show background image if fb image url exists
    // if not the default is used and does not show around the plugin
    if (app.user.fbProfilePicUrl)
    {
       $(jqOo).css('background-image', 'url(' + app.user.fbProfilePicUrl + ')');
    }
  }
  if (app.videoEnabled) {
    app.log(2, 'Video turned on.');
    $(jqObj).attr('title', 'Disable video');
  }
  else {
    app.log(2, 'Video turned off.');
    $(jqObj).attr('title', 'Enable video');
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
  var jqObj = $('#lower-right > #audio'),
      bMuteAudio;
  if (!jqObj)
  {
     app.log(4, "couldn't find video button");
  }
  bMuteAudio = $(jqObj).hasClass('off');
  Callcast.MuteLocalAudioCapture(bMuteAudio);
  $(jqObj).toggleClass('off');
  if (bMuteAudio) {
    app.log(2, 'Audio muted.');
    $(jqObj).attr('title', 'Unmute audio');
  }
  else {
    app.log(2, 'Audio unmuted.');
    $(jqObj).attr('title', 'Mute audio');
  }
  return false;
} /* changeAudio() */

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
  if (winId.match('credentials2')) {
    /*
     * Remove any message. */
    $('p.login-error', winId).hide().text('');
    $('input#name', winId).off('keydown.s04072012', keypressNameHandler);
    $('input#btn', winId).off('click.s04072012', onJoinNow);
  }
  else if (winId.match('meeting')) {
    $('#lower-right > #video').off('click.s04172012a', changeVideo);
    $('#lower-right > #audio').off('click.s04172012b', changeAudio);

  }
  else if (winId.match('chatInp')) {
    $('input.chatTo', winId).off('keydown.s04172012g', keypressChatHandler);
    $('input.send', winId).off('click.s04172012g', sendChat);
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
  var winH = $(window).height(),
      winW = $(window).width(),
      jqMask, jqWin;
  /*
   * Set mask height and width to fill the whole screen. */
  jqMask = $('#mask');
  jqMask.css({'width': winW, 'height': winH});
  /*
   * Transition effect. */
  jqMask.fadeIn(1000, activateWindow(winId));
  jqMask.fadeTo('slow', 0.8);
  /*
   * Center window. */
  jqWin = $(winId);
  jqWin.css('top', winH / 2 - jqWin.height() / 2);
  jqWin.css('left', winW / 2 - jqWin.width() / 2);
  /*
   * Transition effect.*/
  jqWin.fadeIn(2000);
  /*
   * Add class active. */
  jqWin.addClass('active');
  /*
   * Add focus to input name. */
  $('input#name', jqWin).focus();
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
  var jqActive = $('.window.active');
  if (jqActive[0]) {
    // Remove class active and call deactivate function.
    console.log("closeWindow", jqActive);
    jqActive.removeClass('active');
    deactivateWindow('#' + jqActive.attr('id'));
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
  var winH = $(window).height(),
      winW = $(window).width(),
      jqW, meetW, meetOff;
  /*
   * Set mask height and width to fill the whole screen. */
  $('#mask').css({'width': winW, 'height': winH});
  /*
   * Update resizable windows. */
  $('#boxes .window.resizable').each(function(i, e) {
    $(e).css('top', winH / 2 - $(e).height() / 2);
    $(e).css('left', winW / 2 - $(e).width() / 2);
  });
  /*
   * Update window #meeting. */
  jqW = $('#meeting');
  meetW = jqW.width();
  meetOff = winW / 2 - meetW / 2;
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
   var jqDiv = $('#meeting > #zoom > .cloudcarousel'),
       width, height, item, newWidth, newHeight,
       widthScale, heightScale, scale, left, top;
   if (jqDiv.length > 0)
   {
      width = $('#meeting > #zoom').width();
      height = $('#meeting > #zoom').height();
      item = $(jqDiv).data('item');
      newWidth = width; // * 1.0; //app.carousel.options.xSpotRatio;
      newHeight = height; // * 1.0; //app.carousel.options.ySpotRatio;
      widthScale = newWidth / item.orgWidth;
      heightScale = newHeight / item.orgHeight;
      scale = (widthScale < heightScale) ? widthScale : heightScale;
      item.orgWidth *= scale;
      item.orgHeight *= scale;
      item.plgOrgWidth *= scale;
      item.plgOrgHeight *= scale;

      // center div in zoom div
      left = (width - item.orgWidth) / 2;
      top = (height - item.orgHeight) / 2;

      $(jqDiv).css('width', item.orgWidth + 'px');
      $(jqDiv).css('height', item.orgHeight + 'px');
      $(jqDiv).css('left', left + 'px');
      $(jqDiv).css('top', top + 'px');
   }
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
    app.log(2, 'onJoinNow');

    // get the nick name, return back to dialog if not defined
    var usrNm = $('#credentials2 > input#name').val();

    // user must enter fb or nick name if both not entered
    // display error
    if (usrNm.length < 1) {
      $('#credentials2 > p.login-error').text('Please enter a name to continue.').
        fadeIn('fast');
      return false;
    }

    // set app name from dialog text field
    app.user.name = encodeURI(usrNm);
    Callcast.SetNickname(app.user.name); // TODO should be somewhere else
    app.log(2, 'User name:' + usrNm);

    // close dialog
    closeWindow();

    app.userLoggedIn = true;
    $(document).trigger('one-login-complete', 'OnJoinNow() -- non-FB-login');

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
    app.log(2, 'enterId');
    closeWindow();
    openWindow('#credentials2');
} /* onJoinNow() */

///
/// \brief check login credential and display login dialog if necessary.
///
function checkCredentials()
{
  var jqActive;
  app.log(2, 'checkCredentials');

  // this method is called on a fb status change
  // so do nothing if we're already logged in
  if (app.userLoggedIn)
  {
     return;
  }

  // check if there's an error being displayed
  jqActive = $('.window.active#errorMsgPlugin');
  if (jqActive.length === 0)
  {
    // check fb login status and prompt if not skipped and not logged in
    if (!app.user.fbSkipped && !FB.getAuthResponse())
    {
      openWindow('#credentials');
    }
    else // fb logged in update fb logged in status
    {
      closeWindow();
      app.userLoggedIn = true;
      $(document).trigger('one-login-complete', 'checkCredentials - FB Login');
    }
  }
} /* checkCredentials() */

//
// If there is a specific room listed in the URL, then create/join that room.
//
// If there is no room specified, then we need to ask the server to create a random
// room name and we'll join that room.
//
function handleRoomSetup() {
  app.log(2, 'handleRoomSetup entered');
  var room_to_create = $.getUrlVar('roomname') || '';

  room_to_create = room_to_create.replace(/ /g, '');
    app.log(2, 'room_to_create ' + room_to_create);

  Callcast.CreateUnlistedAndJoin(room_to_create, function(new_name) {
    // We successfully created the room.
    // Joining is in process now.
    // trigger of joined_room will happen upon join complete.

    app.user.scheduleName = 'Place to meet up';
    app.user.scheduleJid = new_name + Callcast.AT_CALLCAST_ROOMS;
    app.user.scheduleTitle = 'Open room';

    app.log(2, "Room named '" + new_name + "' has been created. Joining now.");
    app.log(2, 'window.location ' + window.location);
    if (room_to_create.length < 1)
    {
       var newUrl = window.location + '?roomname=' + new_name;
       app.log(2, 'replacing state ' + newUrl);
       history.replaceState(null, null, newUrl);
    }
  });
}

///
/// \brief display upgrade button if there are optional upgrades
///
function checkForPluginOptionalUpgrades()
{
  // assume that by the time we get here the plugin is loaded
  // and the user has been prompted for any required update
  // if a plugin update is available show the download button
  if (Callcast.pluginUpdateAvailable())
  {
    app.log(2, "checkForPluginOptionalUpgrades upgrade available current " + Callcast.GetVersion() + " new " + Callcast.PLUGIN_VERSION_CURRENT);
    $("#lower-right > #dlbtn").css("display", "block");
  }
}
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
  var title, prompt;
  app.log(2, 'tryPluginInstall');
  // check plugin installed.
  // if plugin installed but not loaded wait
  // todo get rid of multiple pluginInstalled calls
  if (app.pluginInstalled() && !app.pluginLoaded)
  {
     setTimeout(tryPluginInstall, 500);
  }
  else if (app.pluginInstalled() && app.pluginLoaded && !app.pluginUpgrade) // good to go
  {
    // Close buttons.
    $('.window .close').on('click', closeWindow);
    // Resize window.
    $(window).resize(resizeWindows);

  }
  else { // plugin not loaded or out of date
    // prompt user to install plugin
    // check if plugin is installed and out of date
    // if so change prompt
    if (app.pluginInstalled() && Callcast.pluginUpdateRequired())
    {
       Callcast.SendLiveLog('Local plugin is out of date. Current version: ' + Callcast.GetVersion());
       title = $('#installPlugin > h1');
       title.text('The Gocast.it plugin is out of date');
       prompt = $('#installPlugin > p#prompt');
       prompt.text('Please download and install the new version of the plugin');
    }
    if (!app.pluginInstalled()) {
       Callcast.SendLiveLog('Local plugin is not installed.');
    }
    if (app.osPlatform.isLinux64 || app.osPlatform.isLinux32)
    {
      $('#installPlugin').css('height', 300);
      $('#installPlugin > p > a#dlLink').parent().find('span').addClass('hidden');
      $('#installPlugin > .linuxExplanation').removeClass('hidden');
    }
    else if (app.osPlatform.isWin || app.osPlatform.isMac)
    {
      // do nothing
    }
    else
    {
      $('#installPlugin > p > a#dlLink').parent().text("We are sorry. We couldn't identify your OS.");
    }
    openWindow('#installPlugin');
  }
} /* tryPluginInstall() */

///
/// \brief download from an url
///
function downloadURL(url)
{
    var iframe;
    iframe = document.getElementById('hiddenDownloader');
    if (iframe === null)
    {
        iframe = document.createElement('iframe');
        iframe.id = 'hiddenDownloader';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
}
///
/// \brief update plugin dl msg and dl plugin
///
function doDownload()
{
  // Alert user to download and install the plugin.
  if (app.osPlatform.isWin)
  {
    closeWindow();
    openWindow('#winEula');
  }
  else if (app.osPlatform.isMac)
  {
    downloadURL(app.MAC_DL_URL);
  }
  else if (app.osPlatform.isLinux64)
  {
    downloadURL(app.LIN_64_DL_URL);
  }
  else if (app.osPlatform.isLinux32)
  {
    downloadURL(app.LIN_32_DL_URL);
  }

  // prompt user for next step
  if (app.osPlatform.isMac)
  {
     installPrompt(app.MAC_PL_NAME);
  }
  // windows install path is thru winEula
  // todo linux
}

///
/// \brief display appropriate prompt depending on plugin install type
///
function installPrompt(pluginName)
{
  closeWindow();
  if (app.pluginInstalled() &&
       (Callcast.pluginUpdateRequired() || Callcast.pluginUpdateAvailable()) )
  {
    // chrome can't load an upgraded plugin so prompt user to restart
    if (app.browser.name === 'Chrome')
    {
      openWindow('#chromeRestart');
    }
    else
    {
      openWindow('#pageReload');
    }
  }
  else if (app.browser.name === 'Firefox') // firefox seems to have a problem polling navigator.plugins
  {
    openWindow('#pageReload');
  }
  else // wait for plugin
  {
    openWindow('#winWait');
    checkForPlugin(pluginName);
  }
}
///
/// \brief close the eula window, download the win install file, launch function to check for plugin
///
function winInstall(event)
{
   // close the eula window
   closeWindow();

   // get the windows install file
   $.post(app.WIN_DL_URL,
          function(data)
          {
             console.log(data);
          });

   installPrompt(app.WIN_PL_NAME);
}

///
/// \brief display a message to restart the browser
///
/// the pluginLoaded callback should close the winWait dialog
/// if it doesn't prompt user to restart the browser
///
function winPluginPunt()
{
   $('#winWait > #status > #spinner').attr('src', 'images/red-x.png');
   $('#winWait > #status > #msg').text('Hmmm... looks like the plugin did not load.  Please restart the browser');
}

///
/// \brief periodically check for the player to be installed and prompt user
///
function checkForPlugin(name)
{
   var i, item;
   navigator.plugins.refresh();
   // find player
   for (i = 0; i < window.navigator.plugins.length; i += 1)
   {
      item = window.navigator.plugins[i];
      app.log(2, 'plugin filename ' + item.filename);
      if (item && item.filename === name)
      {
         clearTimeout(app.winTimeout);
         //app.log(2, 'checkForPlugin found player ' + name);
         $('#winWait > #status > #spinner').attr('src', 'images/green-tick.png');
         $('#winWait > #status > #msg').text('The GoCast plugin is installed.');

         // display error msg after a timeout in case the plugin does not load
         app.winTimeout = setTimeout(winPluginPunt, 10000);
         return; // we're done since the plugin is in the list
      }
   }

   // plugin was not found in list wait and recheck
   app.winTimeout = setTimeout(checkForPlugin(name), 3000);
   app.log(2, 'winCheckForPlugin no player, waiting...');
}

///
/// \brief global key handler
///
function docKey(event)
{
   /// no ctrl-<key> accelerators
   if (event.ctrlKey)
   {
      return;
   }
   //app.log(2, "key code " + event.which);

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
          $(app.GROUP_CHAT_IN).focus();
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
   // add chat util to global chat out
  var chatOut = $(app.GROUP_CHAT_OUT),
      util = new GoCastJS.ChatUtil($(app.GROUP_CHAT_OUT).get(0));

  chatOut.data('util', util);  // install global chat util
  $(document).keydown(docKey); // global key handler

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
  navigator.plugins.refresh(); // reload plugins to get any plugin updates

  // Check the browser.
  app.getBrowser();
  app.checkBrowser();

  // login callback
  $(document).bind('checkCredentials', checkCredentials);

  uiInit(); // init user interface
  fbInit(); // init facebook api

  // Login to xmpp anonymously
  Callcast.connect(Callcast.CALLCAST_XMPPSERVER, '');

  // Write greeting into console.
  app.log(2, 'Page loaded.');

  // set the connection status callback
  Callcast.setCallbackForCallback_ConnectionStatus(connectionStatus);


}); // $(document).ready(function())

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
    //Callcast.Callback_AddCarouselContent({id: 'demo2', image: "url('images/demo2-robertmoog.jpg')", altText: 'Robert Moog: I would not call this music.', url: 'http://www.guardian.co.uk/music/2012/may/23/robert-moog-interview-google-doodle'});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'demo2',
                      spoturl: "http://www.guardian.co.uk/music/2012/may/23/robert-moog-interview-google-doodle",
                      spotimage: "url('images/demo2-robertmoog.jpg')"
                      });
  }, 1000);
  /*
   * Third content delayed 2000 ms. */
  setTimeout(function() {
    //Callcast.Callback_AddCarouselContent({id: 'demo3', image: "url('images/demo3-spaceX.png')", altText: 'Launch of SpaceX Falcon 9', url: 'http://www.youtube.com/embed/4vkqBfv8OMM'});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'demo3',
                      spoturl: 'http://www.youtube.com/embed/4vkqBfv8OMM',
                      spotimage: "url('images/demo3-spaceX.png')"
                      });
  }, 2000);
  /*
   * Fourth content delayed 3000 ms. */
  setTimeout(function() {
    //Callcast.Callback_AddCarouselContent({id: 'demo4', image: "url('images/demo4-bawarriorsSF.jpg')", altText: 'Warriors face many hurdles in building S.F. arena', url: 'http://www.sfgate.com/cgi-bin/article.cgi?f=/c/a/2012/05/23/MNM41OLT8K.DTL'});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'demo4',
                      spoturl: 'http://www.sfgate.com/cgi-bin/article.cgi?f=/c/a/2012/05/23/MNM41OLT8K.DTL',
                      spotimage: "url('images/demo4-bawarriorsSF.jpg')"
                      });
  }, 3000);
  /*
   * Fifth content delayed 4000 ms. */
  setTimeout(function() {
    //Callcast.Callback_AddCarouselContent({id: 'demo5', image: "url('images/demo5-wikipedia.jpg')", altText: 'Wikipedia', url: 'http://www.wikipedia.org'});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'demo5',
                      spoturl: 'http://www.wikipedia.org',
                      spotimage: "url('images/demo5-wikipedia.jpg')"
                      });
  }, 4000);
  closeWindow();
  return false;
} /* startDemoContent() */

///
/// \brief add people and whiteboards to room
///
function startPeopleContent()
{
  setTimeout(function() {
    //Callcast.Callback_AddCarouselContent({id: 'person1', image: "url('images/person1.png')", altText: 'person1', url: ''});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'person1',
                      spoturl: '',
                      spotimage: "url('images/person1.png')"
                      });
  }, 0);
  setTimeout(function() {
    //Callcast.Callback_AddCarouselContent({id: 'person3', image: "url('images/person3.png')", altText: 'person3', url: ''});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'person3',
                      spoturl: '',
                      spotimage: "url('images/person3.png')"
                      });
  }, 300);
  setTimeout(function() {
    //Callcast.Callback_AddCarouselContent({id: 'white-board-demo', image: "url('images/white-board-demo.png')", altText: 'white-board-demo', url: ''});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'white-board-demo',
                      spoturl: '',
                      spotimage: "url('images/white-board-demo.png')"
                      });
  }, 600);
  setTimeout(function() {
    //Callcast.Callback_AddCarouselContent({id: 'person4', image: "url('images/person4.png')", altText: 'person4', url: ''});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'person4',
                      spoturl: '',
                      spotimage: "url('images/person4.png')"
                      });
  }, 900);
  setTimeout(function() {
    //Callcast.Callback_AddCarouselContent({id: 'person2', image: "url('images/person2.png')", altText: 'person2', url: ''});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'person2',
                      spoturl: '',
                      spotimage: "url('images/person2.png')"
                      });
  }, 1200);
  setTimeout(function() {
    //Callcast.Callback_AddCarouselContent({id: 'zoe', image: "url('images/zoe.png')", altText: 'zoe', url: ''});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'zoe',
                      spoturl: '',
                      spotimage: "url('images/zoe.png')"
                      });
  }, 1500);
  setTimeout(function() {
    //Callcast.Callback_AddCarouselContent({id: 'person5', image: "url('images/person5.png')", altText: 'person5', url: ''});
    Callcast.AddSpot({spotreplace: 'first-unoc',
                      spottype: "url",
                      spotdivid: 'person5',
                      spoturl: '',
                      spotimage: "url('images/person5.png')"
                      });
  }, 1800);
}
