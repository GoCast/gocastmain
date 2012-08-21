///
/// ui util
///

"use strict";

var GoCastJS = ('undefined' !== typeof(GoCastJS)) ? GoCastJS : {};
GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

///
/// \brief chat output window handler
///        add msg's as spans with user name in bold
///        give msg's id's
///        animage msgs
///
GoCastJS.ChatUtil = function(objIn)
{
  this.domObj = objIn;          // the chat div
  this.jqChat = $(this.domObj); // jq chat div
  this.msgNumber = 0;           // unique msg number assigned to msg's
}; // ChatUtil constructor

///
/// \brief add a message to the chat output window and animate it
///
GoCastJS.ChatUtil.prototype.addMsg = function(msg)
{
  var domMsg = '<span id="'+ this.msgNumber + '">    ' + msg + '<br></span>',
      atBottom,
      span;
  // get scroll pos
  //app.log(2, 'public-message scrollTop ' + jqChat.scrollTop()
  //        + ' scrollHeight ' + jqChat[0].scrollHeight
  //        + ' clientHeight ' + jqChat[0].clientHeight);
  // detect scroll bar at bottom
  // looks like the mouse wheel can put the scroll pos < 1em from bottom so fudge it
  atBottom = Math.abs((this.jqChat.scrollTop() + this.jqChat[0].clientHeight) - this.jqChat[0].scrollHeight) < 10;
  this.jqChat.append(domMsg); // Add message to Message Board.
  if (atBottom) { // if we were at bottom before msg append scroll to bottom
    this.jqChat.scrollTop(this.jqChat[0].scrollHeight);
    //this.jqChat.animate({scrollTop : this.jqChat[0].scrollHeight},'fast');
    // flash new msg
    span = $("span#" + this.msgNumber, this.jqChat);
    //span.animate({color:"red"},
    span.animate({backgroundColor:"red"},
      {duration: 0,
       complete: function() {
        //span.animate({backgroundColor:"transparent"}, 500); // doesn't work, end color is white
        span.animate({backgroundColor:"black"}, 500);
       }
    });
  } else { // flash chat border
    this.jqChat.animate({backgroundColor:"red"},
      {duration: 0,
       complete: function()
       {
         this.jqChat.animate({backgroundColor:"black"}, 500);
         //this.jqChat.animate({backgroundColor:"transparent"}, 500); // doesn't work, end color is white
       }
    });
  }
  ++this.msgNumber; // increment next msg number
}; // addMsg
