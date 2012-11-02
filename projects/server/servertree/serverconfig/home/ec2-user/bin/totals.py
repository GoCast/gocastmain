#!/usr/bin/python
#
# Quick program to output number of users per day.  Relies on 
# processLog.sh to make input file
#
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("inputfile")
args = parser.parse_args()
print args.inputfile
infile=args.inputfile

# print "input file: ", infile  
fb="FBName"
ah="Ad-hoc-Name"
file = open(infile)

lastpart0=""
fbcnt=0
ahcnt=0
linecnt=0
while 1:
    line = file.readline()
    linecnt += 1
    if not line:
        break
    part=line.split()
    # print "part0", part[0], "part1", part[1], "part[2]", part[2]
    if part[0] == lastpart0:
       if part[1].find(fb):
          fbcnt += 1
       elif part[1].find(ah):
          ahcnt += 1
       else:
         print "Input error unexpected line at line:", linecnt, " ", line

    else:
       if lastpart0 != "":
          print "%s,%d,%d,%d" % (lastpart0, fbcnt, ahcnt, fbcnt+ahcnt)
       lastpart0 = part[0]
       fbcnt = 0
       ahcnt = 0
