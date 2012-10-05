//
//
// gcedit.js
// gocast editor class that uses jquery cleditor plugin
//


"use strict";
/*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */
/*global Callcast, app */

var GoCastJS = ('undefined' !== typeof(GoCastJS)) ? GoCastJS : {};
GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

GoCastJS.gcEdit = function(spot, info)
{
  this.DIV = '<div id="gcEditDiv"><textarea id="gcTextArea"></textarea></div>';
  this.spot = spot;
  this.jqSpot = $(spot);
  this.info = info;
  this.jqDiv = $(this.DIV).appendTo(this.jqSpot);
  this.item = this.jqSpot.data('item');

  this.init();
};

GoCastJS.gcEdit.prototype.init = function()
{
  var self = this;
  $("#gcTextArea", this.jqSpot).cleditor(
    {width:this.item.orgWidth, 
     height:this.item.orgHeight,
     updateTextArea:function(html)
     {
       return self.updateTextArea(html);
     },
     updateFrame:function(code)
     {
       return self.updateFrame(code);
     }
    });
  // override mouseover event, prevent showing zoom, trash icons
  // since zooming editor doesn't work yet
  this.jqSpot.mouseover(function(event)
  {
    event.stopPropagation();
    return false;
  });
};
GoCastJS.gcEdit.prototype.updateTextArea = function(html)
{
  console.log("gcEdit.updateTextArea ", html);
  return html;
};
GoCastJS.gcEdit.prototype.updateFrame = function(code)
{
  console.log("gcEdit.updateFrame ", code);
  return code;
};