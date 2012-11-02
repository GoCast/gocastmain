#!/bin/sh
echo
echo Facebook unique userlist contains `grep FBName switchboard.log | cut -d ':' -f 6 | sort -u | wc -l` users.
echo
echo Facebook unique userlist
echo
grep FBName switchboard.log | cut -d ':' -f 6 | sort -u
echo
echo Facebook running userlist contains `grep FBName switchboard.log | cut -d ':' -f 6 | wc -l` users.
echo
echo Facebook running userlist
echo
grep FBName switchboard.log | cut -d ':' -f 6
echo
echo Ad-Hoc unique userlist contains `grep Ad-hoc switchboard.log | cut -d ':' -f 6 | sort -u | wc -l` users.
echo
echo Ad-Hoc unique userlist
echo
grep Ad-hoc switchboard.log | cut -d ':' -f 6 | sort -u
echo
echo Ad-Hoc running userlist contains `grep Ad-hoc switchboard.log | cut -d ':' -f 6 | wc -l` users.
echo
echo Ad-Hoc running userlist
echo
grep Ad-hoc switchboard.log | cut -d ':' -f 6
