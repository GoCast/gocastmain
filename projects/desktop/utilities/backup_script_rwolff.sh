#!/bin/bash

#set -e

REPO="GoCast/webrtc_plugin"
TSTAMP=`date "+%Y%m%d-%H%M%S"`
BACKUP_DIR='/host/backups'
LOGFILE="$BACKUP_DIR/backups.log"
BACKUP_BASE_NAME=$TSTAMP.${REPO/\//-}
SECRETENCRYPTEDTARFILE=bob_secretkey.gpg

GITDIR=$BACKUP_BASE_NAME.git
GITTARBALL=git_$BACKUP_BASE_NAME.tgz.gpg

####################################################################
####################################################################
####################################################################
# Things for users to change
TOFROMNAME="rwolff@xvdth.com"
PASSWORDFILE="/home/rwolff/.gnupg/justjunk.txt"
BASEBACKUPLOCATION=neuronbackups
DOCSTARBALL=bobdocs_${BACKUP_BASE_NAME}.tgz.gpg
GITLOCATION=${BASEBACKUPLOCATION}/gitbackups/
DOCLOCATION=${BASEBACKUPLOCATION}/docbackups/bob/
# After the '/' is your key ID. Select the 8-bytes following the '/'
# Example: sec   1024D/E1CC76DD 2008-12-15
# you would need to select E1CC76DD
SECRETKEYID=E0C222D7

####################################################################
####################################################################
####################################################################

GPG_ENCRYPTOPTS="-v --encrypt --sign --no-use-agent --passphrase-file ${PASSWORDFILE} --yes --batch -r ${TOFROMNAME} -u ${TOFROMNAME} "

# Make Backup Directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "****************************************" >>$LOGFILE 2>&1
echo "  Daily Backup started: $TSTAMP         " >>$LOGFILE 2>&1
echo "****************************************" >>$LOGFILE 2>&1

# Clone a mirror
git clone --mirror git@github.com:$REPO.git $GITDIR >>$LOGFILE 2>&1

# Tarball it up
tar c $GITDIR | gpg $GPG_ENCRYPTOPTS -o $BACKUP_DIR/$GITTARBALL - >>$LOGFILE 2>&1

# Clean Up git directory
rm -rf $GITDIR >>$LOGFILE 2>&1

# Tar up all Documents/Neuron/* items
tar c ~/Documents/Neuron | gpg $GPG_ENCRYPTOPTS -o $BACKUP_DIR/$DOCSTARBALL - >>$LOGFILE 2>&1

# Tar up my secret key
gpg -a --export-secret-keys ${SECRETKEYID} | gpg -c --passphrase-file ${PASSWORDFILE} --batch --yes --no-use-agent -o $BACKUP_DIR/${SECRETENCRYPTEDTARFILE} >>$LOGFILE 2>&1

# Push to S3
cd $BACKUP_DIR
aws --verbose put ${GITLOCATION} $GITTARBALL >>$LOGFILE 2>&1
aws --verbose put ${DOCLOCATION} $DOCSTARBALL >>$LOGFILE 2>&1
aws --verbose put ${DOCLOCATION} $SECRETENCRYPTEDTARFILE >>$LOGFILE 2>&1

# Finally put the log in S3 as well as the most recent of the shell script itself
aws --verbose put neuronbackups/backup_log_$LOGNAME.log $LOGFILE >>$LOGFILE 2>&1
aws --verbose put neuronbackups/backup_script_$LOGNAME.sh $0 >>$LOGFILE 2>&1

# Now prune back the files to keep the past 2 weeks worth.
find $BACKUP_DIR -mtime +14 -exec /bin/rm -f {} \;
# remove from S3 if older than 6 days (change to 21 or 60?)
# aws ls neuronbackups --exec='system("aws rm neuronbackups/$key") if $mod lt "2008-06"'

# finally do an 'ls' sorted with newest items to the bottom.
aws ls neuronbackups --simple -t >>$LOGFILE 2>&1

TSTAMP=`date "+%Y%m%d-%H%M%S"`
echo "****************************************" >>$LOGFILE 2>&1
echo "  Daily Backup finished: $TSTAMP" >>$LOGFILE 2>&1
echo "****************************************" >>$LOGFILE 2>&1
