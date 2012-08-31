///
/// wb.js
/// whiteboard object
///

"use strict";
/*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */
/*global Callcast */

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
  button = $('<div id="wbPenW1"  class="wbPenW" title="Pen Width 1"  penSize="1"></div>').appendTo(this.jqTools).click(this.penWidthClick).data('wb',this.wb);
  this.initCanvas(button);
  button = $('<div id="wbPenW5"  class="wbPenW" title="Pen Width 5"  penSize="5"></div>').appendTo(this.jqTools).click(this.penWidthClick).data('wb',this.wb);
  this.initCanvas(button);
  button = $('<div id="wbPenW7"  class="wbPenW" title="Pen Width 7"  penSize="7"></div>').appendTo(this.jqTools).click(this.penWidthClick).data('wb',this.wb);
  this.initCanvas(button);
  button = $('<div id="wbPenW11" class="wbPenW" title="Pen Width 11" penSize="11"></div>').appendTo(this.jqTools).click(this.penWidthClick).data('wb',this.wb);
  this.initCanvas(button);

  // create pen color button
  button = $('<div id="wbPenColor" class="wbPenColor" title="Pen Color"></div>').appendTo(this.jqTools).click(this.penColorClick).data('wb',this.wb);
  this.initCanvas(button);
  this.initPenColors(this.jqTools);

  this.drawTools(); // init toolbar
};
///
/// \brief pen width button click handler
///
GoCastJS.WhiteBoardTools.prototype.penWidthClick = function(event)
{
  var penSize = $(this).attr('penSize'),
      wb = $(this).data('wb');

  console.log("wbPenW click", penSize, wb);
  wb.settings.lineWidth = penSize;
  wb.settings.apply(wb.wbCtx); // todo encapsulate
  wb.tools.drawTools();
};
///
/// \brief pen color button click handler
///
GoCastJS.WhiteBoardTools.prototype.penColorClick = function(event)
{
  var wb = $(this).data('wb');
  console.log("wbPenColor click", this, wb);
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
  console.log("initCanvas ", w, h, jqElem);
  jqElem.data("ctx", ctx).data('jqCanvas', jqCanvas); // set ref to context
};
///
/// \brief add list of pen colors, canvas, context, references
///
GoCastJS.WhiteBoardTools.prototype.initPenColors = function(jqElem)
{
  // todo init from an array of objects
  // todo better way?
  var jqList = $('<div id="wbPenColors"></div>').appendTo(jqElem),
      jqTable = $('<table id="wbPenColorTable"></table>').appendTo(jqList),
      jqRow, jqTd;

  jqRow = $('<tr id="black"></tr>').appendTo(jqTable);
  jqTd = $('<td class="check"></td>').appendTo(jqRow);
  jqTd = $('<td id="black" class="color" color="#000"></td>').appendTo(jqRow);
  this.initCanvas(jqTd);
  jqRow = $('<tr id="red"></tr>').appendTo(jqTable);
  jqTd = $('<td class="check"></td>').appendTo(jqRow);
  jqTd = $('<td id="blue" class="color" color="#F00"></td>').appendTo(jqRow);
  this.initCanvas(jqTd);
  jqRow = $('<tr id="blue"></tr>').appendTo(jqTable);
  jqTd = $('<td class="check"></td>').appendTo(jqRow);
  jqTd = $('<td id="blue" class="color" color="#00F"></td>').appendTo(jqRow);
  this.initCanvas(jqTd);
  jqRow = $('<tr id="orange"></tr>').appendTo(jqTable);
  jqTd = $('<td class="check"></td>').appendTo(jqRow);
  jqTd = $('<td id="orange" class="color" color="rgba(253, 103, 3, 0.05)"></td>').appendTo(jqRow);
  this.initCanvas(jqTd);
  jqRow = $('<tr id="white"></tr>').appendTo(jqTable);
  jqTd = $('<td class="check"></td>').appendTo(jqRow);
  jqTd = $('<td id="white" class="color" color="#FFF"></td>').appendTo(jqRow);
  this.initCanvas(jqTd);

  jqList.css("display", "none");
};
///
/// \brief draw the tool images when the tool settings change
///
GoCastJS.WhiteBoardTools.prototype.drawTools = function()
{
  var canvas, ctx, w, h,
      wb = this.wb; // closure var for each callback below
  // set pen width button checked state
  $(".wbPenW", this.jqTools).removeClass("checked"); // clear all checked state
  $("#wbPenW" + this.wb.settings.lineWidth, this.jqTools).addClass("checked"); // set checked for current line width
  $(".wbPenW", this.jqTools).each(function(index) // draw pen sizes in current pen color
  {
    var jqThis = $(this),
        penSize = jqThis.attr('penSize'),
        ctx = jqThis.data('ctx'),
        jqCanvas = jqThis.data('jqCanvas'),
        centerX = jqCanvas.attr('width') / 2,
        centerY = jqCanvas.attr('height') / 2;
    console.log("drawTools each", penSize, ctx, centerX, centerY);

    // draw circle in strokeStyle
    ctx.strokeStyle = wb.settings.strokeStyle;
    ctx.fillStyle   = wb.settings.strokeStyle;
    ctx.beginPath();
    ctx.arc(centerX, centerY, penSize/2, 0, 2 * Math.PI, false);
    ctx.fill();
  });
  $(".wbPenColor", this.jqTools).each(function(index)
  {
    var jqThis = $(this),
        penSize = wb.settings.lineWidth,
        ctx = jqThis.data('ctx'),
        jqCanvas = jqThis.data('jqCanvas'),
        w = jqCanvas.attr('width'),
        h = jqCanvas.attr('height'),
        margin = 3,
        downButtonWidth = 15,
        downButtonMargin = 5;
    console.log("drawTools wbPenColor", penSize, ctx, w, h, margin);

    // draw down button
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
    ctx.lineWidth = 1;

    // separate down button from pen color button
    /*
    ctx.beginPath();
    ctx.moveTo(w - downButtonWidth, 0);
    ctx.lineTo(w - downButtonWidth, h);
    ctx.stroke();
    ctx.closePath();
    */
    // draw down arrow
    ctx.beginPath();
    ctx.moveTo(w - downButtonWidth + downButtonMargin  ,     downButtonMargin);
    ctx.lineTo(w                   - downButtonMargin  ,     downButtonMargin);
    ctx.lineTo(w - downButtonWidth/2                   , h - downButtonMargin);
    ctx.lineTo(w - downButtonWidth + downButtonMargin  ,     downButtonMargin);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // draw line in pen color and width todo hilite
    ctx.strokeStyle = wb.settings.strokeStyle;
    ctx.fillStyle   = wb.settings.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(margin,     h/2);
    ctx.lineTo(w - downButtonWidth - margin, h/2);
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
  this.WB_PEN_WIDTH = '<select id="wbSelPenColor" class="wbSel"><option value="1">1</option><option value="3">3</option><option value="5">5</option><option value="7">7</option><option value="11">11</option></select>';
  this.WB_PEN_COLOR = '<select id="wbSelPenColor" class="wbSel">'+
                         '<option value="#000"                    data-imgsrc="images/btn-fb.png">Black</option>'+
                         '<option value="#F00"                    data-imgsrc="images/btn-fb.png">Red</option>'+
                         '<option value="#00F"                    data-imgsrc="images/btn-fb.png">Blue</option>'+
                         '<option value="rgba(253, 103, 3, 0.05)" data-imgsrc="images/btn-fb.png">Orange</option>'+
                         '<option value="#FFF"                    data-imgsrc="images/btn-fb.png">White</option>'+
                       '</select>';
  this.WB_ERASE_BUTTON = '<input type="checkbox" class="ui-button-icon-only" id="erase" /><label for="check">Eraser</label>';

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

  this.tools = new GoCastJS.WhiteBoardTools(this); // add the toolboar

  /*
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
  */
  /*
  $(this.WB_ERASE_BUTTON).appendTo(this.jqWb)
                         .data("wb", this)
                         .button()
                         .click(function(event)
  {
    console.log("wb eraser click");
  });
  */
  this.jqCanvas.data("wb", this); // create ref for handlers todo better way?

  this.settings.apply(this.wbCtx);

  // install handlers
  this.jqCanvas.mousedown(this.onMouseDown);
  this.jqCanvas.mousemove(this.onMouseMove);
  this.jqCanvas.mouseup(this.onMouseUp);
  this.jqCanvas.mouseout(this.onMouseUp); // trigger mouseup on mouseout todo capture mouse and detect mouseup outside of target

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
