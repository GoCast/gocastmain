///
/// wb.js
/// whiteboard object
///

"use strict";
/*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */
/*global Callcast, app */

var GoCastJS = ('undefined' !== typeof(GoCastJS)) ? GoCastJS : {};
GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

///
/// \brief the whiteboard toolbar
///
GoCastJS.WhiteBoardTools = function(whiteBoard)
{
  var button;
  this.wb = whiteBoard;
  this.DIV = '<div id="wbTools"></div>';

  this.jqTools = $(this.DIV).appendTo(this.wb.jqWb); // todo encapsulate

  // create pen width buttons
  button = $('<div id="wbPenW1"  class="wbButton wbPenW" title="Pen Width 1"  penSize="1"></div>').appendTo(this.jqTools).click(this.penWidthClick).data('wb',this.wb);
  this.initCanvas(button);
  button = $('<div id="wbPenW5"  class="wbButton wbPenW" title="Pen Width 5"  penSize="5"></div>').appendTo(this.jqTools).click(this.penWidthClick).data('wb',this.wb);
  this.initCanvas(button);
  button = $('<div id="wbPenW7"  class="wbButton wbPenW" title="Pen Width 7"  penSize="7"></div>').appendTo(this.jqTools).click(this.penWidthClick).data('wb',this.wb);
  this.initCanvas(button);
  button = $('<div id="wbPenW11" class="wbButton wbPenW" title="Pen Width 11" penSize="11"></div>').appendTo(this.jqTools).click(this.penWidthClick).data('wb',this.wb);
  this.initCanvas(button);

  // create pen color button
  this.jqPenColor = $('<div id="wbPenColor" class="wbButton wbPenColor" title="Pen Color"><div class="wb-icon wb-icon-triangle-2-n-s"></div></div>').appendTo(this.jqTools).click(this.penColorClick).data('wb',this.wb);
  this.initCanvas(this.jqPenColor);

  // create eraser
  this.jqEraser = $('<div id="wbEraser"  class="wbEraser" title="Eraser"></div>').appendTo(this.jqTools).click(this.eraserClick).data('wb',this.wb);

  this.initPenColors(this.jqTools);

  this.updateTools(); // init toolbar
};
///
/// \brief pen width button click handler
///
GoCastJS.WhiteBoardTools.prototype.eraserClick = function(event)
{
  var jqThis = $(this).toggleClass('checked'), // toggle class and get jq ref to this
      wb     = jqThis.data('wb');

  wb.tools.jqPenList.css("visibility", "hidden"); // hide pen color list
  wb.tools.updateTools();                      // update tools
};
///
/// \brief pen width button click handler
///
GoCastJS.WhiteBoardTools.prototype.penWidthClick = function(event)
{
  var penSize = $(this).attr('penSize'),
      wb = $(this).data('wb');

  wb.tools.jqEraser.removeClass('checked');
  //console.log("wbPenW click", penSize, wb);
  wb.penSettings.lineWidth = penSize;
  wb.penSettings.apply(wb.wbCtx); // todo encapsulate
  wb.tools.jqPenList.css("visibility", "hidden"); // hide pen color list
  wb.tools.updateTools();
};
///
/// \brief pen color button click handler
///
GoCastJS.WhiteBoardTools.prototype.penColorClick = function(event)
{
  var jqThis = $(this),
      pos    = jqThis.position(),
      h      = jqThis.height(),
      w      = (jqThis.width() + 1) + "px",
      wb     = jqThis.data('wb'),
      spotPos = wb.jqParent.position(),
      spotH   = wb.jqParent.height(),
      toolsPos = wb.tools.jqTools.position(), // wb tools pos todo height is zero so calcs are off
      jqContainer = wb.jqParent.parent(), // spot parent 
      containerH = jqContainer.height(),
      listH   = wb.tools.jqPenList.height(),
      top = pos.top;

  //console.log("wbPenColor click pos ", pos, " h ", h);
  //console.log("wbPenColor spot pos ", spotPos, " h ", spotH);
  //console.log("wbPenColor toolsPos ", toolsPos);
  //console.log("wbPenColor container h", containerH);
  //console.log("wbPenColor list h", listH);

  // this is pos absolute wb tools is pos relative
  if (toolsPos.top + spotPos.top + listH > containerH) // shift up if off bottom of carousel
  {
    top = -(toolsPos.top + spotPos.top + listH - containerH);
  }
  wb.tools.jqEraser.removeClass('checked');
  wb.tools.updateTools();
  // position and display table, todo align selected color
  //console.log("wbPenColor top ", top, " pos.left ", pos.left);
  wb.tools.jqPenList.css({ "top": top,
                           "left": pos.left,
                           "width": w,
                           "visibility": "visible"});
};
///
/// \brief pen color table click handler
///
GoCastJS.WhiteBoardTools.prototype.penColorTrClick = function(event)
{
  var jqThis = $(this),
      jqTd   = $('.color', jqThis),
      name   = jqTd.attr('id'),
      color  = jqTd.attr('color'),
      wb     = jqThis.data('wb');
  //console.log("wbPenColorTr click", this, wb, name, color);

  wb.penSettings.strokeStyle = color; // set current pen color
  wb.penSettings.colorName   = name;
  wb.tools.updateTools();            // update tools
  wb.tools.jqPenList.css("visibility", "hidden"); // hide pen color table
};
///
/// \brief add canvas, context, references to pen width buttons
///
GoCastJS.WhiteBoardTools.prototype.initCanvas = function(jqElem)
{
  var w = jqElem.width(),
      h = jqElem.height(),
      jqCanvas = $('<canvas width = ' + w + ' height = ' + h + '></canvas>').appendTo(jqElem),
      ctx = jqCanvas[0].getContext('2d');
  //console.log("initCanvas ", w, h, jqElem);
  jqElem.data("ctx", ctx); // set ref to context
};
///
/// \brief add list of pen colors, canvas, context, references
///
GoCastJS.WhiteBoardTools.prototype.initPenColors = function(jqElem)
{
  // todo init from an array of objects
  // todo better way?
  var jqRow, jqTd;

  this.jqPenList = $('<div id="wbPenColors"></div>').appendTo(jqElem);
  this.jqPenTable = $('<table id="wbPenColorTable"></table>').appendTo(this.jqPenList);

  jqRow = $('<tr id="black"></tr>').appendTo(this.jqPenTable).click(this.penColorTrClick).data('wb', this.wb);
  jqTd = $('<td id="black" class="check"></td>').appendTo(jqRow);
  jqTd = $('<td id="black" class="color" color="#000"></td>').appendTo(jqRow);
  this.initCanvas(jqTd);
  jqRow = $('<tr id="red"></tr>').appendTo(this.jqPenTable).click(this.penColorTrClick).data('wb', this.wb);
  jqTd = $('<td id="red" class="check"></td>').appendTo(jqRow);
  jqTd = $('<td id="red" class="color" color="#F00"></td>').appendTo(jqRow);
  this.initCanvas(jqTd);
  jqRow = $('<tr id="blue"></tr>').appendTo(this.jqPenTable).click(this.penColorTrClick).data('wb', this.wb);
  jqTd = $('<td id="blue" class="check"></td>').appendTo(jqRow);
  jqTd = $('<td id="blue" class="color" color="#00F"></td>').appendTo(jqRow);
  this.initCanvas(jqTd);
  jqRow = $('<tr id="orange"></tr>').appendTo(this.jqPenTable).click(this.penColorTrClick).data('wb', this.wb);
  jqTd = $('<td id="orange" class="check"></td>').appendTo(jqRow);
  //jqTd = $('<td id="orange" class="color" color="rgba(253, 103, 3, 0.05)"></td>').appendTo(jqRow);
  jqTd = $('<td id="orange" class="color" color="rgb(253, 103, 3)"></td>').appendTo(jqRow);
  this.initCanvas(jqTd);

  this.jqPenList.css("visibility", "hidden"); // hide after creation so table gets flowed and td's get width for canvas creation
};
///
/// \brief draw the tool images when the tool settings change
///
GoCastJS.WhiteBoardTools.prototype.updateTools = function()
{
  var canvas, ctx, w, h,
      wb = this.wb, // closure var for each callback below
      checked = this.jqEraser.hasClass('checked'),
      jqPenWidths = $(".wbPenW", this.jqTools); // pen width buttons

  //console.log("updateTools", checked);
  // set the draw settings
  if (checked)
  {
    wb.settings = wb.eraserSettings;
    wb.settings.apply(wb.wbCtx); // todo encapsulate
    jqPenWidths.addClass('disabled');
    this.jqPenColor.addClass('disabled');
    wb.jqCanvas.addClass('erasing');
  }
  else // select checked pen
  {
    wb.settings = wb.penSettings;
    wb.settings.apply(wb.wbCtx);
    jqPenWidths.removeClass('disabled');
    this.jqPenColor.removeClass('disabled');
    wb.jqCanvas.removeClass('erasing');
  }
  // set pen width button checked state
  $(".wbPenW", this.jqTools).removeClass("checked"); // clear all checked state
  $("#wbPenW" + this.wb.penSettings.lineWidth, this.jqTools).addClass("checked"); // set checked for current line width
  $(".wbPenW", this.jqTools).each(function(index) // draw pen sizes in current pen color
  {
    var jqThis = $(this),
        penSize = jqThis.attr('penSize'),
        ctx = jqThis.data('ctx'),
        centerX = ctx.canvas.width / 2,
        centerY = ctx.canvas.height / 2;

    //console.log("updateTools each", penSize, ctx, centerX, centerY);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // draw circle in strokeStyle
    ctx.strokeStyle = wb.penSettings.strokeStyle;
    ctx.fillStyle   = wb.penSettings.strokeStyle;
    ctx.beginPath();
    ctx.arc(centerX, centerY, penSize/2, 0, 2 * Math.PI, false);
    ctx.fill();
  });
  $(".wbPenColor", this.jqTools).each(function(index)
  {
    var jqThis = $(this),
        iconPos = $('.wb-icon', jqThis).position(),
        penSize = wb.penSettings.lineWidth,
        ctx = jqThis.data('ctx'),
        w = ctx.canvas.width,
        h = ctx.canvas.height,
        marginL = 10, // make this big to line up with pen strokes in drop down
        marginR = 0;
    //console.log("updateTools wbPenColor", penSize, ctx, w, h, iconPos);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // draw line in pen color and width todo hilite
    ctx.strokeStyle = wb.penSettings.strokeStyle;
    ctx.lineWidth   = wb.penSettings.lineWidth;
    ctx.beginPath();
    ctx.moveTo(marginL,                h/2);
    ctx.lineTo(iconPos.left - marginR, h/2);
    ctx.stroke();
    ctx.closePath();
  });

  // draw pen color table
  $("td.check", this.jqTable).removeClass('wb-icon wb-icon-check'); // clear checked state of pen color list
  $("td.check#"+this.wb.penSettings.colorName, this.jqTable).addClass('wb-icon wb-icon-check'); // set checked state of current pen color
  $("td.color", this.jqTable).each(function(index) // draw the pen colors in the table in current pen width
  {
    var jqThis = $(this),
        ctx      = jqThis.data('ctx'),
        w        = ctx.canvas.width,
        h        = ctx.canvas.height,
        color    = jqThis.attr("color"),
        margin   = 5;

    //console.log("draw pen color table entry", this);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // draw line in td color and current pen width
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = wb.penSettings.lineWidth;
    ctx.beginPath();
    ctx.moveTo(margin,     h/2);
    ctx.lineTo(w - margin, h/2);
    ctx.stroke();
    ctx.closePath();
  });
};
///
/// /brief the whiteboard mouse event tracker
///
GoCastJS.WhiteBoardMouse = function(whiteBoard)
{
  this.DOWN = "down";
  this.UP   = "up";
  this.state = this.UP; // mouse state
  this.timeout = 300; // timeout in ms
  this.currentCommand = []; // the current path see mouse handlers
  this.timer = null; // timer for periodic stroke send
  this.lineCt = 0; // count of lines in commands
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
  this.colorName = "blue";
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

  // the canvas html see init for jq, dom objects
  this.WB_CANVAS = '<canvas id="wbCanvas" class="wbCanvas" width="' + this.width + '" height="' + this.height + '"></canvas>';

  this.mouse = new GoCastJS.WhiteBoardMouse(this); // the mouse state
  this.penSettings = new GoCastJS.WhiteBoardSettings(); // current pen settings
  this.eraserSettings = new GoCastJS.WhiteBoardSettings(); // eraser settings
  this.eraserSettings.lineWidth = (this.width / 20) >> 0;
  this.eraserSettings.strokeStyle = "#FFF";
  this.eraserSettings.colorName = "white";

  this.settings = this.penSettings; // the current settings

  this.parent = spot;           // the parent dom object
  this.jqParent = $(this.parent); // the parent jq object

  this.mouseCommands = []; // array of mouse commands

  this.init(); // initialize
}; // whiteboard constructor
///
/// \brief get method to send a stroke when timer goes off
///
GoCastJS.WhiteBoard.prototype.getStrokeTimeout = function()
{
  var self = this; // closure var for timeout callback
  return function()
  {
    var lastCmd, stroke;
    // check if there's anything to send
    console.log("strokeTimeout lineCt ", self.mouse.lineCt);
    if (self.mouse.lineCt > 0) // there are lineto's
    {
      self.mouse.lineCt = 0;
      stroke = self.mouse.currentCommand.slice(0);       // copy command
      self.mouse.currentCommand = [];                    // clear command
      lastCmd = stroke[stroke.length - 1];               // get last lineTo, must be lineTo since lineCt > 0
      console.log("strokeTimeout lastCmd ", lastCmd);
      self.mouse.currentCommand.push({name: 'save', settings: self.settings}); // start new command
      self.mouse.currentCommand.push({name: 'beginPath'});
      self.mouse.currentCommand.push({name: 'moveTo', x: (lastCmd.x >> 0), y: (lastCmd.y >> 0)}); // make start point end of last stroke
      self.wbCtx.moveTo(lastCmd.x, lastCmd.y);
      stroke.push({name: 'stroke'}); // stroke lines
      stroke.push({name: 'restore'}); // finish command
      self.sendStroke(stroke);        // send it
    }
  };
};
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

  this.tools = new GoCastJS.WhiteBoardTools(this); // add the toolboar

  this.jqCanvas.data("wb", this); // create ref for handlers todo better way?

  this.settings.apply(this.wbCtx);

  // install handlers
  this.jqCanvas.mousedown(this.onMouseDown);
  this.jqCanvas.mousemove(this.onMouseMove);
  this.jqCanvas.mouseup(this.onMouseUp);
  this.jqCanvas.mouseout(this.onMouseUp); // trigger mouseup on mouseout todo capture mouse and detect mouseup outside of target

  // change the zoom icon to black for white background
  $("img#upper-left", this.jqParent).attr("src", "images/fullscreen-black.png");

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
  //console.log("WhiteBoard.sendSpot", cmd);
  Callcast.SetSpot(cmd);
};
///
/// \brief send mouse stroke to server
///
/// \throw
///
GoCastJS.WhiteBoard.prototype.sendStroke = function(stroke)
{
  var spotnumber = this.jqParent.attr('spotnumber'); // todo refactor spotnumber location
  console.log("sendStroke ", stroke);
  Callcast.SendSingleStroke({stroke: JSON.stringify(stroke), spotnumber: spotnumber});
};
///
/// \brief do received mouse command array
///
/// \throw
///
GoCastJS.WhiteBoard.prototype.doCommands = function(info)
{
  var i, cmds, stroke;
  if (!info) {throw "WhiteBoard.doCommands info is null";}
  if (info.whiteboardcommandarray)
  { // todo get rid of info.whiteboardcommandarray, no longer used
    cmds = JSON.parse(info.whiteboardcommandarray);
    //console.log("WhiteBoard.doCommands", info, cmds);
    this.mouseCommands = []; // replace commands
    for (i = 0; i < cmds.length; ++i)
    {
      this.mouseCommands.push(cmds[i]); // add command to local list
    }
    //console.log("WhiteBoard.doCommands cmds ", this.mouseCommands);
    this.wbCtx.clearRect(0, 0, this.wbCtx.canvas.width, this.wbCtx.canvas.height);
  }
  if (info.strokes)
  { 
    cmds = JSON.parse(info.strokes);
    //console.log("WhiteBoard.doCommands", info, cmds);
    this.mouseCommands = []; // replace commands
    for (i = 0; i < cmds.strokes.length; ++i)
    {
      this.mouseCommands.push(cmds.strokes[i]); // add command to local list
    }
    //console.log("WhiteBoard.doCommands strokes ", this.mouseCommands);
    this.wbCtx.clearRect(0, 0, this.wbCtx.canvas.width, this.wbCtx.canvas.height);
  }
  if (info.stroke) // todo handle races at server, erase canvas and redraw everything
  {
    stroke = JSON.parse(info.stroke);
    //console.log("WhiteBoard.doCommands stroke ", stroke);
    this.mouseCommands.push(stroke); // add command to local list
  }
  for (i = 0; i < this.mouseCommands.length; ++i)
  {
    this.doCommand(this.mouseCommands[i]);
  }
  this.restoreMouseLocation();
};
///
/// \brief do received mouse command
///
/// \throw
///
GoCastJS.WhiteBoard.prototype.doCommand = function(cmdArray)
{
  var i, cmd;
  console.log("WhiteBoard.doCommand", cmdArray);
  for (i = 0; i < cmdArray.length; ++i) {
    //console.log("cmd", cmdArray[i]);
    switch (cmdArray[i].name) {
      case "save":
        this.wbCtx.save();
        this.settings.applyJson(cmdArray[i].settings, this.wbCtx);
        break;
      case "restore":
        this.wbCtx.restore();
        break;
      case "beginPath":
        this.wbCtx.beginPath();
        break;
      case "closePath":
        this.wbCtx.closePath();
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
///
/// \brief moveTo last lineTo in mousecommands after received strokes are applied to canvas
///
GoCastJS.WhiteBoard.prototype.restoreMouseLocation = function()
{
  var length = this.mouse.currentCommand.length;
  // if mouse not down or commands empty nothing to do
  if (this.mouse.DOWN === this.mouse.state && // mouse is down
      this.mouse.currentCommand.length > 0 && // there are mouse moves
      "lineTo" === this.mouse.currentCommand[length-1].name) // the last command is lineTo
  {
    // move the mouse to last position
    this.wbCtx.moveTo(this.mouse.currentCommand[length-1].x, this.mouse.currentCommand[length-1].y);
    console.log("restoreMouseLocation ", this.mouse.currentCommand[length-1].x, this.mouse.currentCommand[length-1].y);
  }
};
///
/// \brief rezise the canvas, set css dimensions and scale member var
/// 
/// \arg width, height the target sizes as integers
///
GoCastJS.WhiteBoard.prototype.setScale = function(width, height)
{
  var wScale = width/this.width,
      hScale = height/this.height;
      //penColorPos = this.tools.jqPenColor.offset(),
      //penColorH   = this.tools.jqPenColor.height();

  this.scale = (wScale + hScale) / 2; // isotropic, keep aspect ratio
  this.scaleW = wScale;
  this.scaleH = hScale;
  //console.log("scale width " + width + " height " + height + " wScale" + wScale + " hScale " + hScale + " scale " + this.scale);
  this.wbCanvas.style.width = width + "px";
  this.wbCanvas.style.height = height + "px";

  // move pen color table
  // todo causes plugin reloads set dom values instead of jquery works in carousel may work here
  //      for now hide pencolor table on resize, rotate
  //this.tools.jqPenList.css({ "bottom": penColorPos.top + penColorH,
  //                           "left": penColorPos.left});
  this.tools.jqPenList.css("visibility", "hidden");
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
  wb.tools.jqPenList.css("visibility", "hidden"); // hide pen color list

  wb.mouse.timer = setInterval(wb.getStrokeTimeout(), wb.mouse.timeout);
  //console.log('wb.onMouseDown x' + event.offsetX + '(' + x + ') y ' + event.offsetY + '(' + y + ')' , event);
  wb.mouse.state = wb.mouse.DOWN;
  wb.settings.apply(wb.wbCtx);
  wb.wbCtx.beginPath();
  wb.wbCtx.moveTo(x, y);
  wb.mouse.currentCommand = []; // new command array to be sent to server
  wb.mouse.currentCommand.push({name: 'save', settings: wb.settings});
  wb.mouse.currentCommand.push({name: 'beginPath'});
  wb.mouse.currentCommand.push({name: 'moveTo', x: (x >> 0), y: (y >> 0)});
  return false; // disable text selection
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
  clearInterval(wb.mouse.timer); 
  wb.mouse.offsetEvent(event);
  event.stopPropagation();
  if (wb.mouse.DOWN === wb.mouse.state) {
    wb.wbCtx.stroke();
    wb.mouse.currentCommand.push({name: 'stroke'});
    wb.mouse.currentCommand.push({name: 'restore'});
    wb.sendStroke(wb.mouse.currentCommand);
    wb.mouse.currentCommand = [];
  }
  wb.mouse.state = wb.mouse.UP;
  wb.mouse.lineCt = 0;
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
    wb.wbCtx.stroke(); // draw stroke but don't push it, stroke is pushed on mouse up at end of cmd
    wb.mouse.currentCommand.push({name: 'lineTo', x: (x >> 0), y: (y >> 0)});
    ++wb.mouse.lineCt;
  }
};
