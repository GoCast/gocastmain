#!/bin/sh
#
# Note - defaults to no confirmation and dev-mode.
#   Command arg will be used to publish to subdirectory of main site.
#
sh ./publish.sh -s ec2-user@dev.gocast.it dev/$1 -y -d

