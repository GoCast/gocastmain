var GoCastJS = GoCastJS || {};

GoCastJS.FileViewer = {
	isimage: function(fname) {
		return (fname.toLowerCase().match(/\.png$/) || fname.toLowerCase().match(/\.jpg$/) ||
            	fname.toLowerCase().match(/\.gif$/) || fname.toLowerCase().match(/\.tiff$/) ||
          		fname.toLowerCase().match(/\.bmp$/));
	},
	isdocument: function(fname) {
		return (fname.toLowerCase().match(/\.pdf$/) || fname.toLowerCase().match(/\.doc[x]?$/) ||
				fname.toLowerCase().match(/\.ppt[x]?$/) || fname.toLowerCase().match(/\.txt$/) ||
				fname.toLowerCase().match(/\.c(c|xx|pp|ss)?$/) || fname.toLowerCase().match(/\.h(tm|tml)?$/) ||
				fname.toLowerCase().match(/\.js$/) || fname.toLowerCase().match(/\.php$/));
	},
	isformatsupported: function(fname) {
		return (this.isimage(fname) || this.isdocument(fname));
	},
	open: function($view, $mask, fname, flink, filelist) {
		var winW = $(window).width(),
			winH = $(window).height(),
			curIdx = filelist.links.indexOf(flink);
			self = this;

		$mask.css({
			'width': $(window).width(),
			'height': $(window).height()
		}).fadeIn('slow', function() {
			$view.addClass('show').css('z-index', $(this).css('z-index') + 1);
			$('a.pagination', $view).css('z-index', $(this).css('z-index') + 2);
			$('img.close', $view).css('z-index', $(this).css('z-index') + 2);
			self.resize($view);
			self.showfile($view, fname, flink);
		});

		$(document).unbind('keydown').keydown(this.keydownCb($view));
		$view.unbind('hover').hover(function() {
			if (curIdx > 0) {
				$('a#prev', $view).addClass('show');
			}
			if (curIdx < (filelist.links.length-1)) {
				$('a#next', $view).addClass('show');	
			}
		}, function() {
			$('a.pagination', $view).removeClass('show');
		});

		$('a.pagination', $view).unbind('click').click(function() {
			if ('prev' === $(this).attr('id')) {
				curIdx--;
				if (0 === curIdx) {
					$(this).removeClass('show');
				}
				if (!$('a#next', $view).hasClass('show')) {
					$('a#next', $view).addClass('show');
				}
			} else {
				curIdx++;
				if ((filelist.links.length-1) === curIdx) {
					$(this).removeClass('show');
				}
				if (!$('a#prev', $view).hasClass('show')) {
					$('a#prev', $view).addClass('show');
				}
			}
			self.showfile($view, filelist.files[curIdx], filelist.links[curIdx]);
		});

		$('img.close', $view).unbind('click').click(this.closeclickCb($view, $mask));
	},
	resize: function($view) {
		var winW = $(window).width(),
			winH = $(window).height(),
			self = this;

		if ($view.hasClass('show')) {
			$view.css({
				'left': (0.1*winW) + 'px',
				'top': (0.1*winH) + 'px',
				'width': (0.8*winW) + 'px',
				'height': (0.8*winH) + 'px',
			});

			$('#header', $view).css('width', $view.width() + 1);
			$('#note', $view).css('width', $view.width() + 1);
			$('#filecontent', $view).css({
				'width': $view.width() + 1,
				'height': ($view.height() - $('#header', $view).height() - $('#note', $view).height())
			});

			$('#filecontent > #imagefile', $view).each(function() {
				self.placeImage(this);
			});

			$('a.pagination', $view).css('top', ($view.height() - 50)/2 + 'px');
		}
	},
	showfile: function($view, fname, flink) {
		var $filecontent = $('#filecontent', $view);

		$filecontent.html('');
		$('#header > #fname', $view).text(fname);

		if (this.isimage(fname)) {
			$filecontent.css('overflow', 'auto').html('<image id="imagefile" src="' + flink + '" onload="GoCastJS.FileViewer.placeImage(this);"/>');
		} else if(this.isdocument(fname)) {
			$filecontent.css('overflow', 'hidden').html('<iframe id="docfile" src="http://docs.google.com/viewer?' +
							  							'url=http%3A%2F%2Fvideo.gocast.it%2F' + flink.replace(/\//g, '%2F') +
							  							'&embedded=true" style="border: none; width: 100%; height: 100%;"></iframe>');
		}
	},
	placeImage: function(imgele) {
		var $image = $(imgele),
			$filecontent = $image.parent(),
			iwidth = $image.width(),
			iheight = $image.height(),
			fwidth = $filecontent.width(),
			fheight = $filecontent.height();

		if (iheight < fheight && iwidth < fwidth) {
			$image.css({
				'margin-left': (fwidth - iwidth)/2 + 'px',
				'margin-top': (fheight - iheight)/2 + 'px'
			});
		}
	},
	closeclickCb: function($view, $mask) {
		return function() {
			$(document).unbind('keydown').keydown(docKey);
			$('a.pagination', $view).removeClass('show');
			$view.removeClass('show');
			$mask.fadeOut('slow');
		};
	},
	keydownCb: function($view) {
		return function(evt) {
			switch(evt.which || evt.keyCode) {
				case 27:
					$('img.close', $view).click();
					break;
			}
		};
	}
};
