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

GoCastJS.WhiteBoardMouse.prototype.offsetEvent = function(event)
{
  var targetOffset = $(event.target).offset(),
      offX         = event.pageX - targetOffset.left,
      offY         = event.pageY - targetOffset.top;
  console.log("event offsetX " + event.offsetX + "offX " + offX);
  console.log("event offsetY " + event.offsetY + "offY " + offY);
  /*
  //firefox doesn't set event.offset[X,Y]
  if (typeof event.offsetX === "undefined" || typeof event.offsetY === "undefined") {
    event.offsetX = event.pageX - targetOffset.left;
    event.offsetY = event.pageY - targetOffset.top;
  }
  */
};

///
/// \brief white board constuctor
///
GoCastJS.WhiteBoard = function(spot)
{
  this.width = 500; // logicial canvas width
  this.height = 500; // logical canvas height
  this.scale = 1.0; // the scale for x, y dimensions for transform from window to logical coord system
  this.scaleW = 1.0;
  this.scaleH = 1.0;
  this.WB_DIV = '<div id="wbDiv" class="wbDiv"></div>'; // a container div

  // the canvas html see init for jq, dom objects
  this.WB_CANVAS = '<canvas id="wbCanvas" class="wbCanvas" width="' + this.width + '" height="' + this.height + '"></canvas>';

  this.mouse = new GoCastJS.WhiteBoardMouse(this); // the mouse state
  this.parent = spot;           // the parent dom object
  this.jqParent = $(this.parent); // the parent jq object

  this.init(); // initialize
}; // whiteboard constructor

///
/// \brief append  dom objects to parent and style them
///
GoCastJS.WhiteBoard.prototype.init = function()
{
  // create the dom
  this.jqWb     = $(this.WB_DIV).appendTo(this.jqParent);
  this.jqCanvas = $(this.WB_CANVAS).appendTo(this.jqWb);
  this.wbCanvas = this.jqCanvas[0];
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
/// \brief rezise the canvas, set css dimensions and scale member var
/// 
/// \arg width, height the target sizes as integers
///
GoCastJS.WhiteBoard.prototype.setScale = function(width, height)
{
  var wScale = width/this.width,
      hScale = height/this.height;
  this.scale = (wScale + hScale) / 2; // isotropic, keep aspect ratio
  this.scaleW = wScale;
  this.scaleH = hScale;
  console.log("scale width " + width + " height " + height + " wScale" + wScale + " hScale " + hScale + " scale " + this.scale);
  this.wbCanvas.style.width = width + "px";
  this.wbCanvas.style.height = height + "px";
};

///
/// \brief rezise the canvas
/// 
/// \arg width, height the target sizes
///
GoCastJS.WhiteBoard.prototype.resize = function(width, height)
{
  /*
  var wScale = width/this.width,
      hScale = height/this.height,
      scale = (wScale + hScale) / 2;
  console.log("resize width " + width + " height " + height + " wScale" + wScale + " hScale " + hScale + " scale " + scale);
  */
};

///
/// \brief wb jq canvas mouse down handler
///
/// \arg event a JQuery.Event object
///
GoCastJS.WhiteBoard.prototype.onMouseDown = function(event)
{
  var wb = $(this).data("wb"),
       x = event.offsetX / wb.scaleW,
       y = event.offsetY / wb.scaleH;
  event.stopPropagation();
  console.log('wb.onMouseDown x' + event.offsetX + '(' + x + ') y ' + event.offsetY + '(' + y + ')' , event);
  wb.mouse.offsetEvent(event);
  // todo make sure event is a JQuery event
  wb.mouse.state = wb.mouse.DOWN;
  wb.wbCtx.beginPath();
  wb.wbCtx.moveTo(x, y);
  // temp
  //wb.wbCtx.fillStyle = "blue";
  //wb.wbCtx.fillRect(5, 5, 490, 490);

};

///
/// \brief wb jq canvas mouse up handler
///
/// \arg event a JQuery.Event object
///
GoCastJS.WhiteBoard.prototype.onMouseUp = function(event)
{
  var wb = $(this).data("wb"),
       x = event.offsetX / wb.scaleW,
       y = event.offsetY / wb.scaleH;
  console.log('wb.onMouseUp x' + event.offsetX + '(' + x + ') y ' + event.offsetY + '(' + y + ')' , event);
  wb.mouse.offsetEvent(event);
  event.stopPropagation();
  // todo make sure event is a JQuery event
  if (wb.mouse.DOWN === wb.mouse.state) {
    wb.wbCtx.closePath();
  }
  wb.mouse.state = wb.mouse.UP;
};

///
/// \brief wb jq canvas mouse move handler
///
/// \arg event a JQuery.Event object
///
GoCastJS.WhiteBoard.prototype.onMouseMove = function(event)
{
  var wb = $(this).data("wb"),
       x = event.offsetX / wb.scaleW,
       y = event.offsetY / wb.scaleH;
  //console.log('wb.onMouseMove x' + event.offsetX + '(' + x + ') y ' + event.offsetY + '(' + y + ')' , event);
  event.stopPropagation();
  // todo make sure event is a JQuery event
  if (wb.mouse.DOWN === wb.mouse.state){
    wb.wbCtx.lineTo(x, y);
    wb.wbCtx.stroke();
  }
};
