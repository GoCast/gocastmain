///
/// wb.js
/// whiteboard object
///

"use strict";
/*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */

var GoCastJS = ('undefined' !== typeof(GoCastJS)) ? GoCastJS : {};
GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

GoCastJS.WhiteBoardMouse = function(whiteBoard)
{
  this.DOWN = "down";
  this.UP   = "up";

  this.state = this.UP;
};

///
/// \brief white board constuctor
///
GoCastJS.WhiteBoard = function(spot)
{
  this.width = 100;
  this.height = 100;
  this.WB_DIV = '<div id="wbDiv" class="wbDiv"></div>';
  this.WB_CANVAS = '<canvas id="wbCanvas" class="wbCanvas" width="' + this.width + '" height="' + this.height + '"></canvas>';

  this.mouse = new GoCastJS.WhiteBoardMouse(this); // the mouse state
  this.parent = spot;           // the parent dom object
  this.jqParent = $(this.parent); // the parent jq object

  // initialize
  this.init();
}; // whiteboard constructor

///
/// \brief rezise the canvas
/// 
/// \arg width, height the target sizes
///
GoCastJS.WhiteBoard.prototype.resize = function(width, height)
{
  var wScale = width/this.width,
      hScale = height/this.height,
      scale = (wScale + hScale) / 2;
  console.log("resize width " + width + " height " + height + " wScale" + wScale + " hScale " + hScale + " scale " + scale);
};
///
/// \brief append  dom objects to parent and style them
///
GoCastJS.WhiteBoard.prototype.init = function()
{
  // create the dom
  this.jqWb     = $(this.WB_DIV).appendTo(this.jqParent);
  this.jqCanvas = $(this.WB_CANVAS).appendTo(this.jqWb);
  this.wbCtx    = this.jqCanvas[0].getContext("2d");

  this.jqCanvas.data("wb", this); // create ref for handlers todo better way?

  // configure canvas
  this.jqCanvas[0].lineJoin = "round";

  // install handlers
  this.jqCanvas.mousedown(this.onMouseDown);
  this.jqCanvas.mousemove(this.onMouseMove);
  this.jqCanvas.mouseup(this.onMouseUp);
}; // whiteboard init

///
/// \brief wb jq canvas mouse down handler
///
/// \arg event a JQuery.Event object
///
GoCastJS.WhiteBoard.prototype.onMouseDown = function(event)
{
  var wb = $(this).data("wb");
  event.stopPropagation();
  console.log('wb.onMouseDown x' + event.offsetX + ' y ' + event.offsetY, event);
  // todo make sure event is a JQuery event
  wb.mouse.state = wb.mouse.DOWN;
  wb.wbCtx.beginPath();
  wb.wbCtx.moveTo(event.offsetX, event.offsetY);
};

///
/// \brief wb jq canvas mouse up handler
///
/// \arg event a JQuery.Event object
///
GoCastJS.WhiteBoard.prototype.onMouseUp = function(event)
{
  var wb = $(this).data("wb");
  console.log('wb.onMouseUp', event);
  event.stopPropagation();
  // todo make sure event is a JQuery event
  wb.mouse.state = wb.mouse.UP;
};

///
/// \brief wb jq canvas mouse move handler
///
/// \arg event a JQuery.Event object
///
GoCastJS.WhiteBoard.prototype.onMouseMove = function(event)
{
  var wb = $(this).data("wb");
  //console.log('wb.onMouseMove', event);
  event.stopPropagation();
  // todo make sure event is a JQuery event
  if (wb.mouse.DOWN === wb.mouse.state){
    wb.wbCtx.lineTo(event.offsetX, event.offsetY);
    wb.wbCtx.stroke();
  }
};
