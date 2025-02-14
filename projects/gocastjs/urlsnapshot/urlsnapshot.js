var GoCastJS = (undefined !== GoCastJS)? GoCastJS: {};

///
/// \brief generate an image from a URL
/// \param div jq div selector from main html to render needed to inherit window
/// \param options JSON object with:
///    width image width
///    height image height
///    webUrl normalized url to render to image
///    proxyUrl normalized url of renderer
///    disableJS boolean
/// \param imageCallback returns rendered image on success
///
/// \todo failure callback
/// 
GoCastJS.UrlSnapshot = function(snapshotDivSelector, options, imageCallback)
{
	//image desired instead of canvas as it is easier to resize
	var canvasToImage = function(canvas, newDims) 
	{
	    // create a thumbnail image of the top of the page
	    // that is rectangular, canvas.width by canvas.width
	    
	    // get a CanvasPixelArray of the correct dimensions
	    var pixArr = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.width);
	    
	    // create a new canvas from the new pix arr
	    var newCanvas = document.createElement("canvas");
	    newCanvas.getContext("2d").putImageData(pixArr, 0, 0);
	    
	    // get png image data
		var canvasDataURL = newCanvas.toDataURL("image/png");
		var canvasImg = document.createElement("image");
		
		// create image
		canvasImg.width = newDims.width;
		canvasImg.height = newDims.height;
		canvasImg.src = canvasDataURL;
		
		return canvasImg;
	};
	
	var jqSnapshotDiv = $(snapshotDivSelector);
	
	$.ajax({
		url      : options.proxyUrl,					//customizable
		data     : {xhr2: false, url: options.webUrl},	//customizable
		cache    : true,
		dataType : "jsonp",
		success  : function(response) {
						var link = document.createElement("a");
						link.href = options.webUrl;
			
						var frame = document.createElement("iframe");
						frame.width = options.width;
						frame.height = options.height;
						$(frame).css({visibility: "hidden"});
						jqSnapshotDiv.append(frame);
						
						//base url for ajax requests is the domain from which this page is served.
						//change it to the domain of residence of the web page.
						response = response.replace(
										"<head>",
										"<head><base href='"
											+ link.protocol
											+ "//"
											+ link.hostname
											+ "/"
											+ link.pathname
											+ "' />"
								   );
						
						if(true === options.disableJS) {
							response = response.replace(/\<script/gi,"<!--<script");
							response = response.replace(/\<\/script\>/gi,"<\/script>-->");
						}
						
						//Fill iframe's body with ajax response
						frame.contentWindow.document.open();
						$(frame.contentWindow).load(function() {
							var jqFrameBody = $(frame).contents().find("body");
							
							//html2canvas creates a canvas element containing the rendered image
							//and passes it through the following callback
							html2canvas(jqFrameBody, {
								onrendered: function(snapshotCanvas) {
													var image = canvasToImage(snapshotCanvas, {
														width  : options.width,
														height : options.height
													});
													imageCallback(image);
											}
							});
						});
						frame.contentWindow.document.write(response);
						frame.contentWindow.document.close();
				   }
	});
};

///
/// \brief get info from url
/// \param url target url
/// \return JSON object with info:
///    title header title tag
///    type  mime type
/// 
GoCastJS.getUrlInfo = function(options, callback)
{
	$.ajax(
	{
		url      : options.proxyUrl,					//customizable
		data     : {xhr2: false, url: options.webUrl},	//customizable
		cache    : true,
		dataType : "jsonp",
		success  : function(response)
        {
           var result = (/<title>(.*?)<\/title>/m).exec(response);
           var info = {};
           if (result)
           {
               var title = result[1];
               info.title = title;
           }
           callback(info);
        }
    });
};
