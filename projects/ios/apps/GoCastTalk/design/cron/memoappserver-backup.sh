FILE=/home/ec2-user/backup/`date +%Y%m%d`-database-backup.tar
tar cfv $FILE /home/ec2-user/database
bzip2 -9 $FILE
