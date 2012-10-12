#!/bin/sh
echo "remove GoCast people amke new log"
grep -v -i -E "Gannes|masa|sandra|manjesh|mmalavalli|jk|koning|wolff|Vadasz|Novotny|Watanabe|Mirapuri|Leuschel|bobtest|bob-windows" switchboard.log | grep '^[0-9]' | grep "Name" > sml.log
cat sml.log | cut -d ' ' -f 1 -f6 | cut -d ':' -f1 -f2 | sed -e 's/:/ /' > sml2.log
sort -u sml2.log > sml2.unique
exit
echo
echo Facebook unique userlist contains `grep FBName sml.log | cut -d ':' -f 6 | sort -u | wc -l` users.
echo
echo Facebook unique userlist
echo
grep FBName sml.log | cut -d ':' -f 6 | sort -u
echo
echo Facebook running userlist contains `grep FBName sml.log | cut -d ':' -f 6 | wc -l` users.
echo
echo Facebook running userlist
echo
grep FBName sml.log | cut -d ':' -f 6
echo
echo Ad-Hoc unique userlist contains `grep Ad-hoc sml.log | cut -d ':' -f 6 | sort -u | wc -l` users.
echo
echo Ad-Hoc unique userlist
echo
grep Ad-hoc sml.log | cut -d ':' -f 6 | sort -u
echo
echo Ad-Hoc running userlist contains `grep Ad-hoc sml.log | cut -d ':' -f 6 | wc -l` users.
echo
echo Ad-Hoc running userlist
echo
grep Ad-hoc sml.log | cut -d ':' -f 6
############# Exit ########
exit 
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
