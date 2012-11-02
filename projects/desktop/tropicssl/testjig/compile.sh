#!/bin/sh
cc sauce1.cpp -o sauce1 -DSPECIALSAUCE -DTESTIT -I../include -L../library -ltropicssl
cc holes.cpp -o holes -I../include -L../library -ltropicssl
