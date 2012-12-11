var GoCastJS = GoCastJS || {};

GoCastJS.FileViewer = {
	isimage: function(fname) {
		return (fname.toLowerCase().match(/.png$/) || fname.toLowerCase().match(/.jpg$/) ||
            	fname.toLowerCase().match(/.gif$/) || fname.toLowerCase().match(/.tiff$/) ||
          		fname.toLowerCase().match(/.bmp$/));
	},
	isdocument: function(fname) {
		return (fname.toLowerCase().match('.pdf$'));
	},
	isformatsupported: function(fname) {
		return (this.isimage(fname) || this.isdocument(fname));
	},
	open: function($view, $mask, fname, flink) {
		var winW = $(window).width(),
			winH = $(window).height(),
			self = this;

		$mask.css({
			'width': $(window).width(),
			'height': $(window).height()
		}).fadeIn('slow', function() {
			$view.addClass('show').css({
				'left': (0.2*winW) + 'px',
				'top': (0.1*winH) + 'px',
				'width': (0.6*winW) + 'px',
				'height': (0.8*winH) + 'px',
				'z-index': $(this).css('z-index') + 1
			});

			$('#header', $view).css('width', $view.width() + 1);
			$('img.close', $view).css('z-index', $(this).css('z-index') + 2);
			$('#filecontent', $view).css({
				'width': $view.width() + 1,
				'height': ($view.height() - $('#header', $view).height())
			});

			self.showfile($view, fname, flink);
		});
		$('img.close', $view).unbind('click').click(this.closeclickCb($view, $mask));
	},
	resize: function($view) {
		var winW = $(window).width(),
			winH = $(window).height();

		if ($view.hasClass('show')) {
			$view.css({
				'left': (0.2*winW) + 'px',
				'top': (0.1*winH) + 'px',
				'width': (0.6*winW) + 'px',
				'height': (0.8*winH) + 'px',
			});

			$('#header', $view).css('width', $view.width() + 1);
			$('#filecontent', $view).css({
				'width': $view.width() + 1,
				'height': ($view.height() - $('#header', $view).height())
			});			
		}
	},
	showfile: function($view, fname, flink) {
		var $filecontent = $('#filecontent', $view);

		$filecontent.html('');
		$('#header > #fname', $view).text(fname);

		if (this.isimage(fname)) {
			$filecontent.css('overflow', 'auto').html('<image id="imagefile" src="' + flink + '" />');
		} else if(this.isdocument(fname)) {
			$filecontent.css('overflow', 'hidden').html('<iframe id="docfile" src="http://docs.google.com/viewer?' +
							  							'url=http%3A%2F%2Fvideo.gocast.it%2F' + flink.replace(/\//g, '%2F') +
							  							'&embedded=true" style="border: none; width: 100%; height: 100%;"></iframe>');
		}
	},
	closeclickCb: function($view, $mask) {
		return function() {
			$view.removeClass('show');
			$mask.fadeOut('slow');
		};
	}
};