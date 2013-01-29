var GoCastJS = GoCastJS || {};

GoCastJS.WikiBrowsers = {};

GoCastJS.WikiBrowser = function(spotdiv, info) {
	this.$container = $(spotdiv);
	this.info = info;

	$('<div id="wikibrowser"><div id="toolbar">' +
	  '<input id="searchkey" placeholder="enter search topic" />' +
	  '<a id="search" title="search wikipedia" class="toolbutton icon-picto" href="javascript:void(0);">s</a>' +
	  '<a id="back" title="previous page" class="toolbutton-disabled icon-picto" href="javascript:void(0);">&lt;</a>' +
	  '<a id="fwd" title="next page" class="toolbutton-disabled icon-picto" href="javascript:void(0);">&gt;</a>' +
	  '</div><div id="window"></div><div id="wait">}</div></div>').appendTo(this.$container);

	this.history = {
		searchrsps: [],
		index: -1,
		getback: function() {  return this.searchrsps[this.index-1]; },
		getfwd: function() {  return this.searchrsps[this.index+1]; },
		get: function() { return this.searchrsps[this.index]; },
		add: function(rsp) { this.searchrsps.splice(++(this.index), 0 , rsp); },
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
			$('#wikibrowser > #toolbar > #searchkey', this.browser.$container).keypress(this.searchkeykeypressCallback());
			$('#wikibrowser > #toolbar > #search', browser.$container).click(this.searchclickCallback());
			$('#wikibrowser > #toolbar > #back', browser.$container).click(this.backclickCallback());
			$('#wikibrowser > #toolbar > #fwd', browser.$container).click(this.fwdclickCallback());
		},
		searchclick: function(searchkey) {
			$('#wikibrowser > #toolbar > #searchkey', this.browser.$container).val(searchkey);
			$('#wikibrowser > #toolbar > #search', this.browser.$container).click();
		},
		searchkeykeypressCallback: function() {
			var self = this;
			return function(event) {
				var keycode = event.which || event.keyCode;
				if (keycode === 13) {
					self.searchclickCallback()();
				}
			};
		},
		searchclickCallback: function() {
			var self = this;
			return function() {
				var searchkey = $('#wikibrowser > #toolbar > #searchkey', self.browser.$container).val();
				if (searchkey) {
					Callcast.SetSpot({
						spottype: 'wiki',
						spotnumber: self.browser.info.spotnumber,
						search: searchkey
					});
				}
			};
		},
		backclickCallback: function() {
			var self = this;
			return function() {
				if (!self.browser.history.atStart()) {
					self.showLoadingSign();
					Callcast.SetSpot({
						spottype: 'wiki',
						spotnumber: self.browser.info.spotnumber,
						history: 'back',
						title: self.browser.history.getback().parse.title
					});
				}
			};
		},
		fwdclickCallback: function() {
			var self = this;
			return function() {
				if (!self.browser.history.atEnd()) {
					self.showLoadingSign();
					Callcast.SetSpot({
						spottype: 'wiki',
						spotnumber: self.browser.info.spotnumber,
						history: 'fwd',
						title: self.browser.history.getfwd().parse.title
					});
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
			var containerSelector = '.typeContent.wiki[spotnumber="' + this.browser.info.spotnumber.toString() + '"]';
			var iframe = document.querySelector(containerSelector + ' > #wikibrowser > #window > iframe');
			var browserWin = document.querySelector(containerSelector + ' > #wikibrowser > #window');
			var self = this;

			if (!newsearch) {
				self.showLoadingSign();
			}

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
				var $body = $(iframe).contents().find('body');

				// Convert edit links into table of content links
				$('span.editsection a', $body).each(function() {
					$(this).html('Table of Contents');
					$(this).attr('href', '#toc');
					$(this).attr('title', 'go to table of contents');
				});

				$('a', $body).each(function() {
					// Change target for external links to new tab
					if ($(this).hasClass('external')) {
						$(this).attr('target', '_blank');
					}
					// Hide enlarge image buttons
					if ($(this).hasClass('internal') && 'Enlarge' === $(this).attr('title')) {
						$(this).css('display', 'none');
					}
					// Change image hyperlink to point to the actual image and open in a new tab
					// All non-image wiki links are modified to open in the iframe
					if ($(this).attr('href').match(/^\/wiki\//)) {
						if ($(this).hasClass('image')) {
							$(this).attr('href', decodeURI($('img', this).attr('src'))).attr('target', '_blank');
						} else {
							var searchterm = $(this).attr('href').split('/')[2];
							$(this).attr('onclick', 'window.top.GoCastJS.WikiBrowsers[\'' +
										 self.browser.$container.attr('id') + '\'].searchclick("' +
										 decodeURI(searchterm) + '");');
							$(this).attr('href', 'javascript:void(0);');							
						}
					}
					// For bookmark links, on firefox, use an alternative to location.hash
					if ($(this).attr('href').match(/^#/) && $.browser.mozilla) {
						var tag = $(this).attr('href');
						$(this).attr('onclick', 'showBookmark(\'' + decodeURI(tag) + '\');');
						$(this).attr('href', 'javascript:void(0);');						
					}
				});

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
									'function showBookmark (sBookmark) {\n' +
			  							'var oBookmark = document.getElementById(sBookmark.split(\'#\')[1]);\n' +
			  							'if (oBookmark) { showNode(oBookmark); } else { console.log(\'No bookmark found [\' + sBookmark + \']\'); }\n' +
									'}\n' + '<\/script>',
				errHead = '<!DOCTYPE html><html><head></head><body><div>',
				errHtml = '<h1>Error!</h1><p></p><p><h3>Nothing available for "' +
						  $('#wikibrowser > #toolbar > #searchkey', this.browser.$container).val() + '".</h3></p>';

			bookmarkScript = $.browser.mozilla ? bookmarkScript : '';
			if (response.parse) {
				response.parse.headhtml['*'] = response.parse.headhtml['*']
											   .replace(/<body/, '<body style="font-size: 12px; ' +
															  	 'overflow-x: hidden; margin-left: 20px; ' +
															  	 'margin-right: 20px;" title="Wikipedia: ' +
															  	 response.parse.title + '"');
			}
			iframe.contentWindow.document.write((response.parse ? (response.parse.headhtml['*'] + response.parse.text['*'] +
												bookmarkScript) : (errHead + errHtml)) + '</div></body></html>');
			iframe.contentWindow.document.close();
			$('#wikibrowser > #toolbar > #searchkey', this.browser.$container).val(response.parse ? response.parse.title : '');
			if (response.parse && newsearch) {
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
				url     : window.location.protocol + '//en.wikipedia.org/w/api.php?callback=?&redirects',
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

	this.init();
	GoCastJS.WikiBrowsers[this.$container.attr('id')] = this;
};

GoCastJS.WikiBrowser.prototype.init = function() {
	this.$container.data('wiki', this);
	this.View.init(this);
	this.Network.init(this);
};

GoCastJS.WikiBrowser.prototype.searchclick = function(searchkey) {
	this.View.searchclick(searchkey);
};

GoCastJS.WikiBrowser.prototype.refresh = function() {
	this.View.showSearchResult(this.history.get());
};

GoCastJS.WikiBrowser.prototype.navhistory = function(dir, title) {
	this.View.showLoadingSign();

	if (this.history['get' + dir]()) {
		this.View.showSearchResult(this.history[dir]());
	} else {
		if (dir === 'back') {
			this.history.back();	
		}
		this.onsearchclick(title);
	}
};

GoCastJS.WikiBrowser.prototype.onsearchclick = function(searchkey) {
	this.View.showLoadingSign();
	this.Network.beginSearch(searchkey);
};

GoCastJS.WikiBrowser.prototype.onsearchresult = function(response, newsearch) {
	this.View.showSearchResult(response, newsearch);
};

GoCastJS.WikiBrowser.prototype.doSpot = function(info) {
	if (info.search) {
		this.onsearchclick(info.search);
	} else if (info.history) {
		if (info.cmdtype === 'setspot') {
			this.navhistory(info.history, info.title);
		} else if (info.cmdtype === 'addspot' && info.title) {
			this.onsearchclick(info.title);
		}
	}
};
