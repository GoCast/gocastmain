#!/bin/sh
export PATH=$PATH:/usr/local/bin
export NODE_PATH=/usr/local/lib/node_modules:$NODE_PATH

# User specific aliases and functions
export LD_LIBRARY_PATH=/home/ec2-user/libs:/usr/lib:/lib:/usr/local/lib
echo "Starting bosh-server from inittab via /usr/local/bin/bosh-server.sh" >>/var/log/bosh-server.log

/usr/local/bin/bosh-server >>/var/log/bosh-server.log 2>&1
