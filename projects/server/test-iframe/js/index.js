/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \file index.js
 *
 * \brief JavaScript code for Gocast.it plug-in.
 *
 * \note This code reqires jQuery v1.7.2.
 *
 * \author Net-Scale Technologies, Inc.,
 *         <a href="http://www.net-scale.com">www.net-scale.com</a>\n
 *         Created April 7, 2012 (paula.muller@net-scale.com)
 *
 * Copyright (c) 2012 XVD. All rights reserved.
 */
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

 /*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */
 'use strict';

function keypress(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var url;
  if (event.altKey || event.ctrlKey)
  {
    return;
  }
  switch (event.which || event.keyCode)
  {
    case 13:                            // Enter key
      event.preventDefault();
      url = $("input#input").val();
      console.log("keypress url ", url);
      $("#iframe").attr("src", url);
      break;
  }
} 

$(document).ready(function(event)
{
  var url = $.getUrlVar('url');

  $('input#input').on('keydown', keypress);
  $("input#input").val("http://www.tumblr.com"); // the tumblr test
  if ('undefined' !== typeof(url))
  {
    console.log("ready url ", url);
    $("#iframe").attr("src", url);
  }
});
$.extend({
getUrlVars: function() {
 var vars = [], hash, i,
     hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
 for (i = 0; i < hashes.length; i += 1)
 {
   hash = hashes[i].split('=');
   vars.push(hash[0]);
   vars[hash[0]] = hash[1];
 }
 return vars;
},
getUrlVar: function(name) {
 return $.getUrlVars()[name];
}
});
