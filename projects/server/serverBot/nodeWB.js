/*jslint node: true, nomen: true */

var sys = require('util');
var fs = require('fs');
var evt = require('events');

var Canvas = require('canvas');

var eventManager = new evt.EventEmitter();
var argv = process.argv;

'use strict';

var GoCastJS = GoCastJS || {};


///
/// \brief whiteboard settings object
///
GoCastJS.NodeWhiteBoardSettings = function()
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
GoCastJS.NodeWhiteBoardSettings.prototype.apply = function(context)
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
GoCastJS.NodeWhiteBoardSettings.prototype.applyJson = function(settings, context)
{
  if (!settings)             {throw "NodeWhiteBoardSettings.applyJson received settings is null";}
  if (!settings.lineJoin)    {throw "NodeWhiteBoardSettings.applyJson received settings lineJoin is null";}
  if (!settings.strokeStyle) {throw "NodeWhiteBoardSettings.applyJson received settings strokeStyle is null";}
  if (!settings.lineWidth)   {throw "NodeWhiteBoardSettings.applyJson received settings lineWidth is null";}
  context.lineJoin    = settings.lineJoin;
  context.strokeStyle = settings.strokeStyle;
  context.lineWidth   = settings.lineWidth;
};

GoCastJS.NodeWhiteBoard = function(w, h, info) {
    this.wb = new Canvas(w, h);
    this.ctx = this.wb.getContext('2d');

    this.penSettings = new GoCastJS.NodeWhiteBoardSettings(); // current pen settings

    this.eraserSettings = new GoCastJS.NodeWhiteBoardSettings(); // eraser settings
    this.eraserSettings.lineWidth = (this.width / 20) >> 0;
    this.eraserSettings.strokeStyle = "#FFF";
    this.eraserSettings.colorName = "white";

    this.settings = this.penSettings;
    this.settings.apply(this.ctx);
};

///
/// \brief do received mouse command array
///
/// \throw
///
GoCastJS.NodeWhiteBoard.prototype.doCommands = function(info)
{
  var i, cmds, stroke, image;
  if (!info) {throw "WhiteBoard.doCommands info is null";}
  if (info.strokes) //todo remove this when server stops sending stroke lists
  {
    cmds = JSON.parse(info.strokes);
//    console.log("WhiteBoard.doCommands", info, cmds);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    for (i = 0; i < cmds.strokes.length; i += 1)
    {
      this.doCommand(cmds.strokes[i]);
    }
  }
  if (info.image)
  {
    // load image from data url
    image = new Canvas.Image();
    image.onload = function()
    {
      this.ctx.drawImage(this, 0, 0);
    };
    image.src = info.image;
  }
//TODO:RMW - fix??  this.restoreMouseLocation();
};

///
/// \brief do received mouse command
///
/// \throw
///
GoCastJS.NodeWhiteBoard.prototype.doCommand = function(cmdArray)
{
  var i, cmd;
//  console.log("WhiteBoard.doCommand", cmdArray);
  for (i = 0; i < cmdArray.length; i += 1) {
//    console.log("cmd", cmdArray[i]);
    switch (cmdArray[i].name) {
      case "save":
        this.ctx.save();
        this.settings.applyJson(cmdArray[i].settings, this.ctx);
        break;
      case "restore":
        this.ctx.restore();
        break;
      case "beginPath":
        this.ctx.beginPath();
        break;
      case "closePath":
        this.ctx.closePath();
        break;
      case "moveTo":
        this.ctx.moveTo(cmdArray[i].x, cmdArray[i].y);
        break;
      case "lineTo":
        this.ctx.lineTo(cmdArray[i].x, cmdArray[i].y);
        break;
      case "stroke":
        this.ctx.stroke();
      break;
      default:
        throw "WhiteBoard.doCommand unknown cmd " + cmdArray[i].name;
    }
  }
};

GoCastJS.NodeWhiteBoard.prototype.Save = function(filename, cbSuccess, cbFailure) {
var out = fs.createWriteStream(__dirname + filename),
    stream = this.wb.createPNGStream();

    stream.on('data', function(chunk){
        out.write(chunk);
    });

    stream.on('error', function(err){
        console.log('Writing whiteboard png - ERROR: ' + err);
        if (cbFailure) {
            cbFailure(err);
        }
    });

    stream.on('end', function(){
        out.end();
        if (cbSuccess) {
            cbSuccess();
        }
    });

};

exports.NodeWhiteBoard = GoCastJS.NodeWhiteBoard;
