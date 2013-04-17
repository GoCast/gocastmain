"use strict";

var GoCastJS = GoCastJS || {};

GoCastJS.gcDeskShare = function(spot, info) {
	this.zoomed = false;
	this.spot = spot;
	this.jqSpot = $(spot);
	this.info = info;
	this.DIV = '<div id="gcDeskShareDiv" class="deskshare"><video autoplay muted></video></div>';
	this.jqDiv = $(this.DIV).appendTo(this.jqSpot).css("position", "absolute");
	this.div = this.jqDiv[0];
	this.item = this.jqSpot.data('item');
	this.screen = $('video', this.div).get(0);
	this.jqSpot.data('gcDeskShare', this);
}

GoCastJS.gcDeskShare.prototype.zoom = function(z) {
	this.zoomed = z;
	if (this.zoomed) {
		$(this.div).css('overflow', 'scroll');
	} else {
		$(this.div).css('overflow', 'hidden');
	}
}

GoCastJS.gcDeskShare.prototype.setScale = function(width, height) {
	this.div.style.width = width + 'px';
	this.div.style.height = height + 'px';

	if (this.zoomed) {
		this.screen.width = 1280;
		this.screen.height = 720;
	} else {
		this.screen.width = width;
		this.screen.height = height;
	}
}

GoCastJS.gcDeskShare.prototype.doSpot = function(info) {
	var self = this;

	if (info.owner === Callcast.nick) {
	    navigator.webkitGetUserMedia({
	      video: {
	        mandatory: {
	          chromeMediaSource: 'screen',
	          minWidth: 1280,
	          minHeight: 720,
	          maxWidth: 1280,
	          maxHeight: 720
	        }
	      }
	    },
	    function(stream) {
	      Callcast.localdesktopstream = stream;
	      self.screen.src = webkitURL.createObjectURL(stream);
	      Callcast.shareDesktop(Callcast.localdesktopstream);
	    },
	    function(e) {
	      alert('DeskShare: Error Code = ' + e.code);
	    });
	} else {
		if (Callcast.participants[info.owner]) {
			Callcast.participants[info.owner].screenvid = this.screen;
		}
	}
}
