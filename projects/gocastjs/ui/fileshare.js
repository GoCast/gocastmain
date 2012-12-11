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
  this.DIV = '<div id="gcFileShareDiv" class="fileshare">' +
             '<div id="status"></div>' +
             '<div id="links"><ul></ul></div>' +
             '<div id="fileinput" title="Open file">+<input id="uploadFile" type="file" name="myFile" onchange="loadAFile(' +
             this.jqSpot.attr('id') + ');" /></div>' +
             '</div>';
  this.info = info;
  this.jqDiv = $(this.DIV).appendTo(this.jqSpot).css("position", "absolute");
  this.div = this.jqDiv[0];
  this.item = this.jqSpot.data('item');
  this.links = $('#gcFileShareDiv > #links > ul', this.jqSpot);
  this.uploadReader = new FileReader();
  this.uploadName = '';
  this.up = new GoCastJS.SendFileToFileCatcher(Callcast.connection, Callcast.room, Callcast.FILECATCHER);
  this.maxFileSize = 5 * 1024 * 1024; // 5MB max.
  this.dndZone = this.jqSpot.get(0);

  this.dndZone.ondragover = function () {
    this.classList.add('enter');
    return false;
  };

  this.dndZone.ondragleave = function() {
    this.classList.remove('enter');
    return false;
  }

  this.dndZone.ondragend = function () {
    this.classList.remove('enter');
    return false;
  };

  this.dndZone.ondrop = function (e) {
    this.classList.remove('enter');
    e.preventDefault();
    self.UploadFile(e.dataTransfer.files);
  };

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

        self.setStatus('Sharing: DONE');
        setTimeout(function() { self.hideStatus(); }, 2000);
      },
      function() {
        console.log('SEND FAILED.');
        self.setStatus('Sharing: FAILED');
        setTimeout(function() { self.hideStatus(); }, 2000);
      },
      function(name, sent, total) {
        if (total) {
          self.setStatus('Sharing: ' + Math.floor((sent*100)/total) + '%');
        }
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

  $('.name', this.jqSpot).text('Fileshare').css('position', 'absolute');
  this.jqSpot.hover(function() {
      app.carousel.disableMousewheel();
    },
    function() {
      app.carousel.enableMousewheel();
  });

  if (!sessionStorage.gcpFileShareHelpShown) {
    this.showStatus('Drag and drop here');
    setTimeout(function() { self.hideStatus(); }, 4000)
    sessionStorage.gcpFileShareHelpShown = 'shown';    
  }
};

GoCastJS.gcFileShare.removeLink = function(spotnum, links, remlinkkey) {
  var linksobj = JSON.parse(links.replace(/\'/g, '"'));
  delete linksobj[remlinkkey];
  Callcast.SetSpot({
    spottype: 'fileshare',
    spotnumber: spotnum,
    links: JSON.stringify(linksobj)
  }, function(msg) {
    console.log('removeLink - SetSpot callback: ', msg);
  });
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
      var onclick = 'GoCastJS.gcFileShare.removeLink(' +
                      this.info.spotnumber.toString() + ', \'' +
                      linksStr.replace(/\"/g, '\\\'') + '\', \'' +
                      k +
                    '\')';
      var imageclass = '';


      /*if (k.toLowerCase().match(/.png$/) || k.toLowerCase().match(/.jpg$/) ||
          k.toLowerCase().match(/.gif$/) || k.toLowerCase().match(/.tiff$/) ||
          k.toLowerCase().match(/.bmp$/)) {
        imageclass = ' image';
      }*/
      mods += ('<li class="linkitem"><a href="javascript:void(0);" onclick="GoCastJS.FileViewer.open($(\'#fileviewer\'), $(\'#mask\'), \'' +
               k + '\', \'' + links[k] + '\');" class="link" title="Open: ' + k + '">' + k + '</a>' +
               '<a href="javascript:void(0);" class="removelink" onclick="' + onclick + '" title="Remove: ' + k + '">x</a></li>');
      /*mods += ('<li class="linkitem"><a target="_blank" href="' + links[k] + '" class="link' + imageclass + '" title="Open: ' + k + '">' + k + '</a>' +
               '<a href="javascript:void(0);" class="removelink" onclick="' + onclick + '" title="Remove: ' + k + '">x</a></li>');*/
    }
  }

  this.links.append(mods);
};

GoCastJS.gcFileShare.prototype.showStatus = function(msg) {
  $('#status', this.jqDiv).addClass('show').text(msg);
  $('#links', this.jqDiv).addClass('hide');
  $('#fileinput', this.jqDiv).addClass('hide');
  $('#dnd', this.jqDiv).addClass('hide');
};

GoCastJS.gcFileShare.prototype.hideStatus = function(msg) {
  $('#status', this.jqDiv).removeClass('show');
  $('#links', this.jqDiv).removeClass('hide');
  $('#fileinput', this.jqDiv).removeClass('hide');
  $('#dnd', this.jqDiv).removeClass('hide');
};

GoCastJS.gcFileShare.prototype.setStatus = function(msg) {
  $('#status', this.jqDiv).text(msg);
};

///
/// \brief rezise the ui object, set css dimensions and scale member var
///
/// \arg width, height the target sizes as integers
///
GoCastJS.gcFileShare.prototype.setScale = function(width, height)
{
  this.div.style.width = width + 'px';
  this.div.style.height = height + 'px';

  $('#links', this.jqDiv).css({
    'width': width + 'px',
    'height': (0.9*height) + 'px'
  });
  $('#fileinput', this.jqDiv).css({
    'top': (0.9*height) + 'px',
    'width': width + 'px',
    'height': (0.1*height) + 'px',
    'line-height': (0.1*height) + 'px'
  });
  $('#status', this.jqDiv).css({
    'line-height': height + 'px'
  });
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

GoCastJS.gcFileShare.prototype.UploadFile = function(DragDropFiles) {
  var us = $('#uploadFile', this.jqSpot).get(0),
      self = this,
      oFile;

  // In the case of Drag-N-Drop, we have to get the file info from the calling parameter
  if (!DragDropFiles) {
    if (us.files.length === 0) { return; }
    oFile = us.files[0];
  }
  else {
    // In drag-n-drop, we are given the files array directly.
    if (DragDropFiles.length === 0) { return; }
    oFile = DragDropFiles[0];
  }

  if (oFile.size > this.maxFileSize) {
    this.showStatus('File too big (Max size: ' + this.maxFileSize/1024 + ' KB)');
    setTimeout(function() { self.hideStatus(); }, 2000);
  }
  else {
    this.showStatus('Sharing: ...');
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

