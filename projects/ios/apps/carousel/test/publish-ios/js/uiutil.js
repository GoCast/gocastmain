///
/// ui util
///

/*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */
/*global app */

"use strict";

var GoCastJS = ('undefined' !== typeof(GoCastJS)) ? GoCastJS : {};
GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

///
/// \brief chat output window handler
///        add msg's as spans with user name in bold
///        give msg's id's
///        animage msgs
///
GoCastJS.ChatUtil = function(objIn, animCb)
{
  this.MIN_NAME_WIDTH = 0.1; // 10%
  this.MAX_NAME_WIDTH = 0.25; // 25%
  this.domObj = objIn;          // the chat div
  this.jqChat = $(this.domObj); // jq chat div
  this.jqTable = $("<table></table>").appendTo(this.jqChat);
  this.jqSpan = $('<span id="text-width"></span>').appendTo(this.jqChat);
  this.msgNumber = 0;           // unique msg number assigned to msg's
  this.animCb = animCb;         // the animate callback
}; // ChatUtil constructor

///
/// \brief add a message to the chat output window and animate it
///
GoCastJS.ChatUtil.prototype.addMsg = function(name, val)
{
  var domRow = '<tr id="'+ this.msgNumber + 
                 '"><td class="name"><span class="name-span">' + name + 
                 '</span></td><td class="val"><span class="val-span">' + val + '</span></td>',
      atBottom,
      jqFlash,
      self = this; // ref for animate callbacks
  // detect scroll bar at bottom
  // looks like the mouse wheel can put the scroll pos < 1em from bottom so fudge it
  atBottom = Math.abs((this.jqChat.scrollTop() + this.jqChat[0].clientHeight) - this.jqChat[0].scrollHeight) < 10;
  // get scroll pos
  //console.log("name " + name + " val " + val);
  //console.log('public-message scrollTop ' + this.jqChat.scrollTop()
  //        + ' scrollHeight ' + this.jqChat[0].scrollHeight
  //        + ' clientHeight ' + this.jqChat[0].clientHeight
  //        + 'atBottom' + atBottom);
  this.jqTable.append(domRow); // Add message to Message Board.
  this.adjustWidths();
  if (atBottom) { // if we were at bottom before msg append scroll to bottom
    this.jqChat.scrollTop(this.jqChat[0].scrollHeight);
    //this.jqChat.animate({scrollTop : this.jqChat[0].scrollHeight},'fast');
    // flash new msg
    jqFlash = $("tr#" + this.msgNumber + " span.val-span", this.jqTable);
    jqFlash.toggleClass('flash').toggleClass('flash', 500);
  } else { // flash chat border
    this.jqChat.effect('highlight', { color:"red"}, 500);
    //this.jqChat.toggleClass('flash').toggleClass('flash', 500);
  }
  ++this.msgNumber; // increment next msg number

}; // addMsg
///
/// \brief adjust widths of columns
///
GoCastJS.ChatUtil.prototype.adjustWidths = function()
{
  var nameWidth, valWidth, self = this,
      tableWidth = this.jqTable.width(),
      chatWidth = this.jqChat.width(),
      nameWidthMax = tableWidth * this.MAX_NAME_WIDTH,
      nameWidthMin = tableWidth * this.MIN_NAME_WIDTH,
      nameWidthCur = nameWidthMin;

  // calc nameWidth
  $('tr', this.jqTable).each(function(index, val)
  {
    //console.log("adjustWidths ", index, " ", val);
    nameWidth = self.getTextWidth($("td.name > span", val).html());
    if (nameWidth > nameWidthCur)
    {
      nameWidth = nameWidth > nameWidthMax ? nameWidthMax : nameWidth;
      nameWidth = nameWidth < nameWidthMin ? nameWidthMin : nameWidth;
      nameWidthCur = nameWidth;
    }
  });
  // given nameWidth use rest of table width for val and set column widths
  valWidth = chatWidth - nameWidthCur;
  //console.log("nameWidth ", nameWidthCur, " valWidth ", valWidth);
  $("td.name", this.jqTable).css("width", nameWidthCur >> 0 + "px");
  $("td.val", this.jqTable).css("width", valWidth >> 0 + "px");
};
///
/// \brief get text width of string
///
GoCastJS.ChatUtil.prototype.getTextWidth = function(text)
{
  this.jqSpan.html(text);
  return this.jqSpan.width();
};
///
/// \brief adjust child dimensions
///
/// note don't use jquery .css because this is called on carousel resize
///
GoCastJS.ChatUtil.prototype.adjust = function(width)
{
  // adjust table
  //var width = this.jqChat[0].style.width; // doesn't work
  this.jqTable[0].style.width = width;
};