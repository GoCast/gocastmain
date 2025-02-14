#!/bin/sh

# Assume we'll be wanting confirmations asked
confirm=1

# Assume we will want minimizing and obfuscation
devmode=0

# set dest dir
dir="carousel"
# username@servername:  (dont forget the : at the end)
server="ec2-user@video.gocast.it:"


#
# Process command line args.
#
# If we have a '-y' or '-f', we will not ask permission
# If we have '-d', we will no use the minimizer and no jscrambler either. Just push.
#
# Otherwise, we make the destination directory equal to the argument.
#
# example: ./publish.sh -y html/jk
#   This would publish to the server in html/jk (rather than the default) and NOT ask for permission
#
until [ $# -eq 0 ]
do
case "$1" in
  -y|-f)
      echo ==== No confirmations will be requested.
      confirm=0
      sleep 1
      ;;
  -s)
# Override server name default
# Adds ':' to the end of the inbound server name automatically.
      server=$2:
      echo ==== Server being reconfigured to: $server
      sleep 1
      shift
      ;;
  -d|--debug|-dev|--devel)
      echo ==== No minimization. No obfuscation. DEV_PUBLISH
      devmode=1
      sleep 1
      ;;
  * ) dir=$1
      echo ==== Publishing will now occur to $server$dir
      ;;
esac
shift;
done

finaldest=$server$dir

# Temporary staging location locally prior to copying to the server.
tempdest=`mktemp -d /tmp/publish.XXXXXXXXXX`

gc="java -jar ../../desktop/utilities/closure-compiler/compiler.jar"
gcopts=""
jspost="php ../../desktop/utilities/jscrambler_php_client/postup.php"
jsget="php ../../desktop/utilities/jscrambler_php_client/get.php"
jsstatus="php ../../desktop/utilities/jscrambler_php_client/status.php"

# Expects that there will be an argument passed to it which is the original file name.
# Also assumes that the filename will end in '.js' and output will become '.min.js'
# Lastly - a second argument specifies the destination beyond $tempdest above.
# Example:
# gcprep "js/carousel.js" "js/carousel.js"
# This will process js/carousel.js --> js/carousel.js.min.js
#   and then cp js/carousel.js.min.js $tempdest/js/carousel.js
#
# A more complex/instructive example...
# gcprep "../../xmpp-peerconnection/callcast.js" "js/callcast.js"
# This winds up with an intermediate file of ../../xmpp-peerconnection/callcast.js.min.js
# which gets copied to $tempdest/js/callcast.js
#
function gcpublish() {

  out=$1".min.js"
  $gc $gcopts --js $1 --js_output_file $out
  cp $out $tempdest/$2
  rm -f $out

  return 0
}

if [ $confirm -eq 1 ]
then
# prompt user
read -p "PRODUCTION_PUBLISH: Are you sure you want to publish to $dir? " yn
case $yn in
    [Yy]* ) break;;
    * ) exit;;
esac
fi

#
# copy base files to a temporary location prior to obfuscation/minimization
#

cp -r * $tempdest
cp ../../xmpp-peerconnection/callcast.js $tempdest/js
cp ../../gocastjs/webrtc/peerconnection.js $tempdest/js
cp ../../gocastjs/ui/*.js $tempdest/js
cp ../../gocastjs/ibb/ibb.js $tempdest/js

function obfuscate() {
# Now obfuscate and minimize files that need it.
  tempjs=$tempdest/jscramble_staging
  mkdir $tempjs
  # make a temp spot for all the files that will live in js/ in the finaldest
  mkdir $tempjs/js
  cp $tempdest/js/callcast.js $tempjs/js
  cp $tempdest/js/peerconnection.js $tempjs/js
  cp $tempdest/js/wb.js $tempjs/js
  cp $tempdest/js/gcedit.js $tempjs/js
  cp $tempdest/js/wiki.js $tempjs/js
  cp $tempdest/js/ibb.js $tempjs/js

  cw=`pwd`
  cd $tempjs
  zip -r $tempdest/jscramble_upload.zip .
  cd $cw

  id=`$jspost $tempdest/jscramble_upload.zip`
  echo ==== Job submitted to JScrambler. ID is $id
  rm $tempdest/jscramble_upload.zip

  # Now wait for responses

  iswaiting=true

  # until we get a response...keep polling status
  while [ -z "$res" ]
  do
  echo ==== Checking on completion of job....
  res=`$jsstatus $id`
  sleep 2
  done

  if [ $res -ne 0 ]
  then
    echo We have encountered and ERROR. The Error code is $res.
    exit
  fi

  echo ==== JScrambler job completed. Getting results.

  # download output in a .zip
  mkdir $tempjs/out_staging
  $jsget $id >$tempjs/out_staging/output.zip
  cw=`pwd`
  cd $tempjs/out_staging
  unzip output.zip
  # For Mac, all the files wind up in the internet quarantine - remove that issue.
  xattr -d -r com.apple.quarantine .
  cd $cw

  # finally copy the files into their tempdest
  rm -f $tempjs/out_staging/output.zip
  cp -r $tempjs/out_staging/* $tempdest
  # finally we can remove the temporary jscrambler area before copying
  rm -rf $tempjs

return 0
}

function minimize() {
# minimize first using google closure compiler
  gcpublish "js/carousel.js" "js/carousel.js"
  gcpublish "js/index.js" "js/index.js"
  gcpublish "js/callcast-api.js" "js/callcast-api.js"
  gcpublish "js/fb.js" "js/fb.js"
return 0
}

function genTimestampedHtml() {
  echo "Generating timestamped html: $1/$2"
  curtime=`date +%s`
  html=`cat $2`
  html_ts=${html//GOCASTTIMESTAMP/$curtime}
  echo "$html_ts" > $1/$2
}

if [ $devmode -eq 0 ]
then
  obfuscate
  minimize
fi

genTimestampedHtml $tempdest index.html
genTimestampedHtml $tempdest index2.html

if [ $confirm -eq 1 ]
then
# prompt user
read -p "PRODUCTION_PUBLISH: Ready to copy to the server $finaldest? " yn
case $yn in
    [Yy]* ) break;;
    * )
        echo Did not copy to the server. Please remove temp file found at: $tempdest
        exit;;
esac
fi

echo ==== Copying finalized contents to the server at $finaldest

#
# And finally scp the final output to the server.
#
scp -r $tempdest/* $finaldest

# Now get rid of the temp location
rm -rf $tempdest

echo ==== Publishing complete.

