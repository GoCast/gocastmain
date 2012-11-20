var GoCastJS = GoCastJS || {};

GoCastJS.WikiBrowsers = {};

GoCastJS.WikiBrowser = function(containerid) {
	this.$container = $('#' + containerid);
	$('<div id="wikibrowser"><div id="toolbar">' +
	  '<input id="searchkey" placeholder="enter search topic" />' +
	  '<a id="search" title="search wikipedia" class="toolbutton icon-picto" href="javascript:void(0);">s</a>' +
	  '<a id="back" title="previous page" class="toolbutton-disabled icon-picto" href="javascript:void(0);">&lt;</a>' +
	  '<a id="fwd" title="next page" class="toolbutton-disabled icon-picto" href="javascript:void(0);">&gt;</a>' +
	  '</div><div id="window"></div><div id="wait">}</div></div>').appendTo(this.$container);

	this.history = {
		searchrsps: [],
		index: -1,
		add: function(rsp) { this.searchrsps[++(this.index)] = rsp; },
		back: function() { return this.searchrsps[--(this.index)]; },
		fwd: function() { return this.searchrsps[++(this.index)]; },
		atEnd: function() { return (this.searchrsps.length-1 === this.index); },
		atStart: function() { return (0 === this.index); },
		splice: function() { this.searchrsps.splice(this.index+1); }
	};

	this.View = {
		browser: null,
		init: function(browser) {
			this.browser = browser;
			$('#wikibrowser > #toolbar > #searchkey', browser.$container).focus(function() { 
				$(this).get(0).select();
				if (!$.browser.mozilla) {
					$(this).mouseup(function() {
						$(this).unbind('mouseup');
						return false;
					});
				} 
			});
			$('#wikibrowser > #toolbar > #search', browser.$container).click(this.searchclickCallback());
			$('#wikibrowser > #toolbar > #back', browser.$container).click(this.backclickCallback());
			$('#wikibrowser > #toolbar > #fwd', browser.$container).click(this.fwdclickCallback());
		},
		searchclickCallback: function() {
			var self = this;
			return function() {
				self.browser.onsearchclick($('#wikibrowser > #toolbar > #searchkey',
										   self.browser.$container).val());
			};
		},
		backclickCallback: function() {
			var self = this;
			return function() {
				if (!self.browser.history.atStart()) {
					self.showLoadingSign();
					self.showSearchResult(self.browser.history.back());
				}
			};
		},
		fwdclickCallback: function() {
			var self = this;
			return function() {
				if (!self.browser.history.atEnd()) {
					self.showLoadingSign();
					self.showSearchResult(self.browser.history.fwd());
				}
			};
		},
		updatenavbuttons: function() {
			if (this.browser.history.atStart()) {
				$('#wikibrowser > #toolbar > #back', this.browser.$container).removeClass('toolbutton').addClass('toolbutton-disabled');	
			} else {
				$('#wikibrowser > #toolbar > #back', this.browser.$container).removeClass('toolbutton-disabled').addClass('toolbutton');
			}
			if (this.browser.history.atEnd()) {
				$('#wikibrowser > #toolbar > #fwd', this.browser.$container).removeClass('toolbutton').addClass('toolbutton-disabled');	
			} else {
				$('#wikibrowser > #toolbar > #fwd', this.browser.$container).removeClass('toolbutton-disabled').addClass('toolbutton');
			}			
		},
		showLoadingSign: function() {
			var $wait = $('#wikibrowser > #wait', this.browser.$container);
			$wait.addClass('show').css('line-height', $wait.height() + 'px');
		},
		hideLoadingSign: function() {
			$('#wikibrowser > #wait', this.browser.$container).removeClass('show');
		},
		showSearchResult: function(response, newsearch) {
			var iframe = document.querySelector('#' + this.browser.$container.attr('id') +
												' > #wikibrowser > #window > iframe');
			var browserWin = document.querySelector('#' + this.browser.$container.attr('id') +
													' > #wikibrowser > #window');
			var self = this;

			if (iframe) {
				browserWin.removeChild(iframe);
			}

			iframe = document.createElement('iframe');
			iframe.style.border = 'none';
			iframe.style.width = '100%';
			iframe.style.height = '100%';
			browserWin.appendChild(iframe);						
			iframe.contentWindow.document.open();

			$(iframe.contentWindow).load(function() {
				var body = $(iframe).contents().find('body');
				// Adjust font size
				body.css({'margin': '20px', 'font-size': '12px'});
				// Hide enlarge image buttons
				$('a.internal[title="Enlarge"]', body).css('display', 'none');
				// Change image hyperlink to point to the actual image
				$('a.image[href^="/wiki/"]', body).each(function() {
					$(this).attr('href', decodeURI($('img', this).attr('src')));
				});
				// All non-image wiki links are modified to open in the iframe
				$('a[href^="/wiki/"]:not(.image)', body).each(function() {
					var searchterm = $(this).attr('href').split('/')[2];
					$(this).attr('onclick', 'window.top.GoCastJS.WikiBrowsers[\'' + self.browser.$container.attr('id') + 
								 '\'].onsearchclick("' + decodeURI(searchterm) + '");');
					$(this).attr('href', 'javascript:void(0);');
				});
				// For bookmark links, on firefox, use an alternative to location.hash
				$('a[href^="#"]', body).each(function() {
					var tag = $(this).attr('href');
					$(this).attr('onclick', 'showBookmark(\'' + decodeURI(tag) + '\', ' + !$.browser.mozilla + ');');
					$(this).attr('href', 'javascript:void(0);');
				});
				// Change target for external links to new tab
				$('a.external', body).attr('target', '_blank');
				// Hide the 'edit' links for the article
				$('span.editsection', body).css('display', 'none');

				self.hideLoadingSign();
			});

			var bookmarkScript = '<script type="text/javascript">\n' +
									'function showNode (oNode) {\n' +
										'var nLeft = 0, nTop = 0;\n' +
										'for (var oItNode = oNode; oItNode;\n' + 
											  'nLeft += oItNode.offsetLeft,\n' + 
											  'nTop += oItNode.offsetTop, oItNode = oItNode.offsetParent);\n' +
										'document.documentElement.scrollTop = nTop;\n' +
										'document.documentElement.scrollLeft = nLeft;\n' +
									'}\n' +
									'function showBookmark (sBookmark, bUseHash) {\n' +
			  							'if (arguments.length === 1 || bUseHash) { window.location.hash = sBookmark; return; }\n' +
			  							'var oBookmark = document.getElementById(sBookmark.split(\'#\')[1]);\n' +
			  							'if (oBookmark) { showNode(oBookmark); } else { console.log(\'No bookmark found [\' + sBookmark + \']\'); }\n' +
									'}\n' + '<\/script>';
			var errHead = '<!DOCTYPE html><html><head></head><body><div>',
				errHtml = '<h1>Error!</h1><p></p><p><h3>Nothing available for "' +
						  $('#wikibrowser > #toolbar > #searchkey', this.browser.$container).val() + '".</h3></p>';

			iframe.contentWindow.document.write((response.parse ? (response.parse.headhtml['*'] + response.parse.text['*'] +
												bookmarkScript) : (errHead + errHtml)) + '</div></body></html>');
			iframe.contentWindow.document.close();
			$('#wikibrowser > #toolbar > #searchkey', this.browser.$container).val(response.parse ? response.parse.title : '');
			if (response.parse && newsearch) {
				this.browser.history.splice();
				this.browser.history.add(response);
			}
			this.updatenavbuttons();
		}
	};

	this.Network = {
		browser: null,
		init: function(browser) {
			this.browser = browser;
		},
		beginSearch: function(searchkey) {
			var self = this;
			$.ajax({
				url     : 'http://en.wikipedia.org/w/api.php?callback=?&redirects',
				data    : {
					format: 'json',
					action: 'parse',
					page  : searchkey,
					prop  : 'text|headhtml'
				},
				dataType: 'jsonp',
				cache   : true,
				success : function(response) {
					self.browser.onsearchresult(response, true);
				}
			});
		}
	};

	this.View.init(this);
	this.Network.init(this);
	GoCastJS.WikiBrowsers[containerid] = this;
};

GoCastJS.WikiBrowser.prototype.init = function() {
	var $toolbar = $('#wikibrowser > #toolbar', this.$container);
	$toolbar.css('line-height', $toolbar.height() + 'px');
};

GoCastJS.WikiBrowser.prototype.onsearchclick = function(searchkey) {
	this.View.showLoadingSign();
	this.Network.beginSearch(searchkey);
};

GoCastJS.WikiBrowser.prototype.onsearchresult = function(response, newsearch) {
	this.View.showSearchResult(response, newsearch);
}

$(document).ready(function() {
	$('.container').each(function() {
		new GoCastJS.WikiBrowser($(this).attr('id')).init();
	});
});