var GoCastJS = GoCastJS || {};

GoCastJS.WikiBrowsers = {};

GoCastJS.WikiBrowser = function(containerid) {
	this.$container = $('#' + containerid);
	$('<div id="wikibrowser"><div id="toolbar">' +
	  '<input id="searchkey" placeholder="enter search topic" />' +
	  '<a id="search" title="search wikipedia" class="toolbutton icon-picto" href="javascript:void(0);">s</a>' +
	  '</div><div id="window"></div></div>').appendTo(this.$container);

	this.View = {
		browser: null,
		init: function(browser) {
			this.browser = browser;
			$('#wikibrowser > #toolbar > #search', browser.$container).click(function() {
				browser.onsearchclick($('#wikibrowser > #toolbar > #searchkey',
										browser.$container).val());
			});
		},
		showSearchResult: function(response) {
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
					self.browser.onsearchresult(response);
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
	this.Network.beginSearch(searchkey);
};

GoCastJS.WikiBrowser.prototype.onsearchresult = function(response) {
	this.View.showSearchResult(response);
}

$(document).ready(function() {
	$('.container').each(function() {
		new GoCastJS.WikiBrowser($(this).attr('id')).init();
	});
});