///
/// wb.js
/// whiteboard object
///

"use strict";
/*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */
/*global Callcast */

var GoCastJS = ('undefined' !== typeof(GoCastJS)) ? GoCastJS : {};
GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

GoCastJS.WhiteBoardMouse = function(whiteBoard)
{
  this.DOWN = "down";
  this.UP   = "up";

  this.state = this.UP;
  this.currentCommand = []; // the current path see mouse handlers
};

///
/// \brief calc mouse x,y relative to target across browser
///
GoCastJS.WhiteBoardMouse.prototype.offsetEvent = function(event)
{
  var targetOffset = $(event.target).offset(),
      offX         = event.pageX - targetOffset.left,
      offY         = event.pageY - targetOffset.top;
  //console.log("event offsetX " + event.offsetX + "offX " + offX);
  //console.log("event offsetY " + event.offsetY + "offY " + offY);
  return ({x:offX, y:offY});
  /*
  //firefox doesn't set event.offset[X,Y]
  if (typeof event.offsetX === "undefined" || typeof event.offsetY === "undefined") {
    event.offsetX = event.pageX - targetOffset.left;
    event.offsetY = event.pageY - targetOffset.top;
  }
  */
};

///
/// \brief whiteboard settings object
///
GoCastJS.WhiteBoardSettings = function()
{
  this.lineJoin = "round";
  this.strokeStyle = "#00F";
  this.lineWidth = 5;
};
///
/// \brief apply settings to canvas
///
/// \arg context the canvas 2d context
///
GoCastJS.WhiteBoardSettings.prototype.apply = function(context)
{
  // configure canvas
  context.lineJoin    = this.lineJoin;
  context.strokeStyle = this.strokeStyle;
  context.lineWidth   = this.lineWidth;
};
///
/// \brief apply settings to canvas from a JSON object
///
/// \arg recieved json object with context settings
///
/// \throw
///
GoCastJS.WhiteBoardSettings.prototype.applyJson = function(settings, context)
{
  if (!settings)             {throw "WhiteBoardSettings.applyJson received settings is null";}
  if (!settings.lineJoin)    {throw "WhiteBoardSettings.applyJson received settings lineJoin is null";}
  if (!settings.strokeStyle) {throw "WhiteBoardSettings.applyJson received settings strokeStyle is null";}
  if (!settings.lineWidth)   {throw "WhiteBoardSettings.applyJson received settings lineWidth is null";}
  context.lineJoin    = settings.lineJoin;
  context.strokeStyle = settings.strokeStyle;
  context.lineWidth   = settings.lineWidth;
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
  this.WB_PEN_WIDTH = '<select class="wbSel"><option value="1">1</option><option value="3">3</option><option value="5">5</option><option value="7">7</option><option value="11">11</option></select>';
  this.WB_PEN_COLOR = '<select class="wbSel"><option value="#000">Black</option><option value="#F00">Red</option><option value="#00F">Blue</option><option value="neon">Neon</option></select>';

  // the canvas html see init for jq, dom objects
  this.WB_CANVAS = '<canvas id="wbCanvas" class="wbCanvas" width="' + this.width + '" height="' + this.height + '"></canvas>';

  this.mouse = new GoCastJS.WhiteBoardMouse(this); // the mouse state
  this.settings = new GoCastJS.WhiteBoardSettings();

  this.parent = spot;           // the parent dom object
  this.jqParent = $(this.parent); // the parent jq object

  this.mouseCommands = []; // array of mouse commands

  this.init(); // initialize
}; // whiteboard constructor

///
/// \brief init whiteboard
///
GoCastJS.WhiteBoard.prototype.init = function()
{
  // create the dom
  this.jqWb     = $(this.WB_DIV).appendTo(this.jqParent);
  this.jqCanvas = $(this.WB_CANVAS).appendTo(this.jqWb);
  this.wbCanvas = this.jqCanvas[0];
  this.wbCtx    = this.wbCanvas.getContext("2d");

  // add controls and handlers
  $(this.WB_PEN_WIDTH).appendTo(this.jqWb).data("wb", this).change(function(event)
  {
    var wb = $(this).data("wb"),
        val = $(this).val();
    console.log("wb pen width change", val);
    wb.settings.lineWidth = val;
    wb.settings.apply(wb.wbCtx);
  }).val(this.settings.lineWidth);
  $(this.WB_PEN_COLOR).appendTo(this.jqWb).data("wb", this).change(function(event)
  {
    var wb = $(this).data("wb"),
        val = $(this).val();
    console.log("wb pen color change", val);
    wb.settings.strokeStyle = val;
    wb.settings.apply(wb.wbCtx);
  }).val(this.settings.strokeStyle);

  this.jqCanvas.data("wb", this); // create ref for handlers todo better way?

  this.settings.apply(this.wbCtx);

  // install handlers
  this.jqCanvas.mousedown(this.onMouseDown);
  this.jqCanvas.mousemove(this.onMouseMove);
  this.jqCanvas.mouseup(this.onMouseUp);

}; // whiteboard init

///
/// \brief send mouse command to server
///
/// \throw
///
GoCastJS.WhiteBoard.prototype.sendSpot = function()
{
  var spotnumber = this.jqParent.attr('spotnumber'), // todo refactor spotnumber location
      cmd        = {spotnumber: spotnumber, // update 
                    spottype: "whiteBoard", // whiteboard
                    spotreplace: "first-unoc", // set replace for replayed setspot
                    whiteboardcommandarray: JSON.stringify(this.mouseCommands)}; // send command array
  console.log("WhiteBoard.sendSpot", cmd);
  Callcast.SetSpot(cmd);
};
///
/// \brief do received mouse command array
///
/// \throw
///
GoCastJS.WhiteBoard.prototype.doCommands = function(info)
{
  var i, cmds;
  if (!info) {throw "WhiteBoard.doCommands info is null";}
  if (!info.whiteboardcommandarray) // no commands, must be a new whiteboard
  {
    return;
  }
  cmds = JSON.parse(info.whiteboardcommandarray);
  //console.log("WhiteBoard.doCommands", info, cmds);
  this.mouseCommands = []; // replace commands
  for (i = 0; i < cmds.length; ++i)
  {
    this.doCommand(cmds[i]);
    this.mouseCommands.push(cmds[i]); // add command to local list
  }
  //console.log("WhiteBoard.doCommands cmds ", this.mouseCommands);
};
///
/// \brief do received mouse command
///
/// \throw
///
GoCastJS.WhiteBoard.prototype.doCommand = function(cmdArray)
{
  var i, cmd;
  //console.log("WhiteBoard.doCommand", cmdArray);
  for (i = 0; i < cmdArray.length; ++i) {
    //console.log("cmd", cmdArray[i]);
    switch (cmdArray[i].name) {
      case "beginPath":
        this.wbCtx.save();
        this.settings.applyJson(cmdArray[i].settings, this.wbCtx);
        this.wbCtx.beginPath();
        break;
      case "closePath":
        this.wbCtx.closePath();
        this.wbCtx.restore();
        break;
      case "moveTo":
        this.wbCtx.moveTo(cmdArray[i].x, cmdArray[i].y);
        break;
      case "lineTo":
        this.wbCtx.lineTo(cmdArray[i].x, cmdArray[i].y);
        break;
      case "stroke":
        this.wbCtx.stroke();
      break;
      default:
         throw "WhiteBoard.doCommand unknown cmd " + cmdArray[i].name;
    }
  }
};
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
  //console.log("scale width " + width + " height " + height + " wScale" + wScale + " hScale " + hScale + " scale " + this.scale);
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
      point = wb.mouse.offsetEvent(event),
      x = point.x / wb.scaleW,
      y = point.y / wb.scaleH;
  event.stopPropagation();
  //console.log('wb.onMouseDown x' + event.offsetX + '(' + x + ') y ' + event.offsetY + '(' + y + ')' , event);
  // todo make sure event is a JQuery event
  wb.mouse.state = wb.mouse.DOWN;
  wb.wbCtx.beginPath();
  wb.wbCtx.moveTo(x, y);
  wb.mouse.currentCommand = []; // new command array to be sent to server
  wb.mouse.currentCommand.push({name: 'beginPath', settings: wb.settings});
  wb.mouse.currentCommand.push({name: 'moveTo', x: (x >> 0), y: (y >> 0)});
};

///
/// \brief wb jq canvas mouse up handler
///
/// \arg event a JQuery.Event object
///
GoCastJS.WhiteBoard.prototype.onMouseUp = function(event)
{
  var wb = $(this).data("wb"),
      point = wb.mouse.offsetEvent(event),
      x = point.x / wb.scaleW,
      y = point.y / wb.scaleH;
  //console.log('wb.onMouseUp x' + event.offsetX + '(' + x + ') y ' + event.offsetY + '(' + y + ')' , event);
  wb.mouse.offsetEvent(event);
  event.stopPropagation();
  // todo make sure event is a JQuery event
  if (wb.mouse.DOWN === wb.mouse.state) {
    wb.wbCtx.closePath();
    wb.mouse.currentCommand.push({name: 'closePath'});
    wb.mouseCommands.push(wb.mouse.currentCommand);
    wb.mouse.currentCommand = [];
    wb.sendSpot();
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
      point = wb.mouse.offsetEvent(event),
      x = point.x / wb.scaleW,
      y = point.y / wb.scaleH;
  //console.log('wb.onMouseMove x' + event.offsetX + '(' + x + ') y ' + event.offsetY + '(' + y + ')' , event);
  event.stopPropagation();
  // todo make sure event is a JQuery event
  if (wb.mouse.DOWN === wb.mouse.state){
    wb.wbCtx.lineTo(x, y);
    wb.wbCtx.stroke();
    wb.mouse.currentCommand.push({name: 'lineTo', x: (x >> 0), y: (y >> 0)});
    wb.mouse.currentCommand.push({name: 'stroke'});
  }
};
