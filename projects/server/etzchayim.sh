#!/bin/sh
scp ~/GoCast\ Player\ Web\ Plug-In.pkg ec2-user@video.gocast.it:/var/www/etzchayim/GoCastPlayer.pkg
scp ~/GCP.msi ec2-user@video.gocast.it:/var/www/etzchayim/GoCastPlayer.msi
scp ~/GoCastPlayer_i686.tar.gz ec2-user@video.gocast.it:/var/www/etzchayim/GoCastPlayer_i686.tar.gz
scp ~/GoCastPlayer_x86_64.tar.gz ec2-user@video.gocast.it:/var/www/etzchayim/GoCastPlayer_x86_64.tar.gz
# scp serverBot/serverBot.js ec2-user@video.gocast.it:
