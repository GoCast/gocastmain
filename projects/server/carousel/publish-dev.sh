#!/bin/sh
#
# Note - defaults to no confirmation.
#        also, feel free to add -d to this command line arg. It gets passed along.
#
sh ./publish.sh -s ec2-user@dev.gocast.it dev -y $1

