#!/bin/sh
defaultdir="gather/slash"
defaultserver="ec2-user@video.gocast.it:"

if [ -n "$1" ]
then
  serverdir=$1
  echo yes dash n
else
  serverdir=$defaultdir
  echo no dash n
fi

echo Copying files from $defaultserver$serverdir to ./serverconfig/ in 3 seconds...
sleep 3

scp -r $defaultserver$serverdir/* ./serverconfig/

echo Now we are ready for checkin of any changed config files.
