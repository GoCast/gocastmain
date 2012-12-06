//
//
// gcFileShare.js
// gocast file share class
//


"use strict";
/*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */
/*global Callcast, app, FileReader */

var GoCastJS = GoCastJS || {};

GoCastJS.gcFileShare = function(spot, info)
{
  var self = this;

  this.timeout = 1000;
  this.spot = spot;
  this.jqSpot = $(spot);
  this.DIV = '<div id="gcFileShareDiv"><input id="uploadFile" type="file" name="myFile" onchange="loadAFile(' + this.jqSpot.attr('id') + ');" /><div id="links"></div></div>';
  this.info = info;
  this.jqDiv = $(this.DIV).appendTo(this.jqSpot).css("position", "absolute");
  this.div = this.jqDiv[0];
  this.item = this.jqSpot.data('item');
  this.links = $('#gcFileShareDiv > #links', this.jqSpot);
  this.uploadReader = new FileReader();
  this.uploadName = '';
  this.up = new GoCastJS.SendFileToFileCatcher(Callcast.connection, Callcast.room, 'filecatcher@dev.gocast.it/filecatcher');

  this.maxFileSize = 5 * 1024 * 1024; // 5MB max.

  this.uploadReader.onload = function (oFREvent) {
    self.up.SendFile(self.uploadName, oFREvent.target.result,
      function(msg, iq) {
        var links = {};

        if (self.info.links) {
          links = JSON.parse(self.info.links);
        }

        console.log('SEND SUCCESSFUL.');
        console.log('New link to filename: ' +  self.uploadName + ' is: ' + $(iq).attr('link'));
        // Add 'link' and uploadName to links object and call setspot
        links[self.uploadName] = $(iq).attr('link');
        Callcast.SetSpot({spottype: 'fileshare', spotnumber: self.info.spotnumber, links: JSON.stringify(links)}, function(msg) {
            console.log(msg);
          });
      },
      function() {
        console.log('SEND FAILED.');
      },
      function(name, sent, total) {
        var out = 'File: ' + name + ' ' + ' Sent: ' + sent;
        if (total) {
          out += ' of total: ' + total + ', ' + Math.floor((sent*100)/total) + '% complete.';
        }

        console.log(out);
      });
  };

  this.init();
};

GoCastJS.gcFileShare.prototype.init = function()
{
  var self = this;
  this.jqSpot.data('gcFileShare', this);

  //if there's any initial editor content in info, use it
  if (this.info.links) {
    this.setLinks(this.info.links);
  }
};

GoCastJS.gcFileShare.prototype.setLinks = function(linksStr) {
  var links = JSON.parse(linksStr),
      k, mods;

  if (!linksStr || linksStr === '') {
    return;
  }

  // Need to update our internal representation of the list of stringified links.
  this.info.links = linksStr;

  // Now iterate through them and put them in the div.
  this.links.empty();
  mods = '';

  for (k in links) {
    if (links.hasOwnProperty(k)) {
      mods += '<p><a target="_blank" href="' + links[k] + '">' + k + '</a></p>';
    }
  }

  this.links.append(mods);
};

///
/// \brief rezise the ui object, set css dimensions and scale member var
///
/// \arg width, height the target sizes as integers
///
GoCastJS.gcFileShare.prototype.setScale = function(width, height)
{
  /*
  var wScale = width/this.width,
      hScale = height/this.height;

  this.scale = (wScale + hScale) / 2; // isotropic, keep aspect ratio
  this.scaleW = wScale;
  this.scaleH = hScale;
  */
  //console.log("gcFileShare scale width " + width + " height " + height);
  //this.jqDiv.width(width).height(height);
  this.div.style.width = width + 'px';
  this.div.style.height = height + 'px';
};

///
/// \brief set the shared contents to info.links
///
GoCastJS.gcFileShare.prototype.doSpot = function(info)
{
  if (info.links) // && info.from !== app.user.name)
  {
    console.log("gcFileShare doSpot ", info);
    this.setLinks(info.links);
  }
};

GoCastJS.gcFileShare.prototype.UploadFile = function() {
  var us = $('#uploadFile', this.jqSpot).get(0),
      oFile;

  if (us.files.length === 0) { return; }
  oFile = us.files[0];

  // TODO: RMW - check .size for maximums.
  if (oFile.size > this.maxFileSize) {
    alert('File size is too big. Max file size allowed is: ' + this.maxFileSize);
  }
  else {
    this.uploadName = oFile.name;
    this.uploadReader.readAsBinaryString(oFile);
  }
};

function loadAFile(spotid) {
  var gcfileshare = $('#' + spotid).data('gcFileShare');

  if (gcfileshare) {
    gcfileshare.UploadFile();
  }
  else {
    alert('Cannot load file. Spotid is lost: ' + spotid);
  }
}

