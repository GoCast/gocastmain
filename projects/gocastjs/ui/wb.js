///
/// wb.js
/// whiteboard object
///

"use strict";

var GoCastJS = ('undefined' !== typeof(GoCastJS)) ? GoCastJS : {};
GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

///
/// \brief white board constuctor
GoCastJS.WhiteBoard = function(spot)
{
  this.WB_DIV = '<div id="wbDiv class="wbDiv"></div>';
  this.WB_CANVAS = '<canvas id="wbCanvas" class="wbCanvas" width="1000" height="1000"></canvas>';

  this.parent = spot;           // the parent dom object
  this.jqParent = $(this.spot); // the parent jq object

  // initialize
  this.init();
}; // whiteboard constructor

///
/// \brief append  dom objects to parent and style them
///
GoCastJS.WhiteBoard.prototype.init = function()
{
  // create the dom
  this.wbDiv = this.jqParent.append(this.WB_DIV);
  this.wbCanvas = this.wbDiv.append(this.WB_CANVAS);
  this.wbCtx = this.wbCanvas.getContext("2d");

  // install handlers
  $(this.wbCanvas).mousemove(this.onMouseMove);
}; // whiteboard init

///
/// \brief wb jq canvas mouse handler
///
GoCastJS.WhiteBoard.prototype.onMouseMove = function(event)
{
  console.log('wb.onMouseMove', event)
};
