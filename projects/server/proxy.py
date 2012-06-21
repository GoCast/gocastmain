__author__="Niklas von Hertzen <niklas at hertzen.com>"
__date__ ="$19.7.2011 23:16:25$"

#
# GoCast modifications allowed being used NOT in the Google Appengine environment.
#   Re-author: Bob Wolff
#

import urllib2
import base64
import simplejson as json
import urlparse;
from cgi import parse_qs, escape

def application(environ, start_response):
	url = ""
	callback = ""
	response_out = ""
	status = '200 OK'
	parameters = parse_qs(environ.get('QUERY_STRING', ''))
	print 'hi'

	if 'url' in parameters:
		url = escape(parameters['url'][0]);
	if 'callback' in parameters:
		callback = escape(parameters['callback'][0]);

        if url != "" and callback != "":
            try:
                urlInfo = urlparse.urlparse(url);

                if urlInfo.scheme in ["http","https"]:
                    result = urllib2.urlopen(url)
                    requestInfo = result.info();

                    if requestInfo['content-type'] in ["image/jpeg","image/png","image/gif"] or "image/png" in requestInfo['content-type'] or "image/jpg" in requestInfo['content-type'] or "image/jpeg" in requestInfo['content-type'] or "image/gif" in requestInfo['content-type'] or "text/html" in requestInfo['content-type'] or "application/xhtml" in requestInfo['content-type']:
#                        if 'xhr2' in parameters:
#                            response_headers = [("Access-Control-Allow-Origin", "*"), ('Content-Type', requestInfo['content-type'])];
#                            response_out = "bob3" + result.read();
#                        else:
                            response_headers = [('Content-Type', "application/javascript")];
                            if "text/html" in requestInfo['content-type'] or "application/xhtml" in requestInfo['content-type']:
                                htmlContent = result.read();
                                try:
                                    response_out = callback + "(" + json.dumps(htmlContent) + ")"; 
                                except:
                                    #this certainly isn't the best solution, but works for most common cases
                                    response_out = callback + "(" + json.dumps(unicode(htmlContent,"ISO-8859-1")) + ")"; 
                            else:
                                response_out = callback + "(" + json.dumps("data:" + requestInfo['content-type'] + ";base64," + base64.b64encode( result.read()) ) + ")";                   
                    else:
                        response_headers['Content-Type'] = "application/javascript";
                        response_out = callback + "(" + json.dumps("error:Invalid mime:" + requestInfo['content-type']) + ")";
                else:
                    response_headers = [('Content-Type', "application/javascript")];
                    response_out = callback + "(" + json.dumps( "error:Invalid protocol:" + urlInfo.scheme ) + ")" ;

            except urllib2.URLError, e:
                response_headers['Content-Type'] = "application/javascript";
                response_out = callback + "(" + json.dumps( "error:Application error" ) + ")" ;
        
#        else:
#        	status = '200 OK';
#        	response_out = 'No url or callback given.';
#        	response_headers = [('Content-type', 'text/plain')];

	response_headers.append(('Content-Length', str(len(response_out))));
	start_response(status, response_headers);
	return [response_out]
	

