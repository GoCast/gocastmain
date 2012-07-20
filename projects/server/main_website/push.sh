#!/bin/sh
# push html, css, images to main website
scp -r *.html css stylesheets images gocast@vqs764.pair.com:public_html/gocastit
