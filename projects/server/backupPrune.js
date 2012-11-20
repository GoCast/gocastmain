/*

  This program uses the external program 'zip' to backup files into an archive and place that archive in a destination
  location. It is also used to prune that destination location down to a 'most recent' number of files. This is a
  typical backup scenario where a daily backup is done and you only want to keep the last 7 days worth of daily
  backups. And in another directory, weekly backups are done and there's only to be 4 weekly backups kept etc.
  The 'keepmaxfiles' option allows pruning down to that number in the destination directory.

  Typical usage - crontab -e
  # every 10 minutes run a backup and keep the last 6.
  0,10,20,30,40,50 * * * * /usr/local/bin/node /Users/rwolff/dev/gocastmain/projects/server/backupPrune.js
            -a -d /Users/rwolff/backups/min -s /Users/rwolff/Pictures/Export -k 6 >>/var/log/cronroot.log
  # every hour, run a backup to a different destination and keep 24
  1 * * * * /usr/local/bin/node /Users/rwolff/dev/gocastmain/projects/server/backupPrune.js
            -a -d /Users/rwolff/backups/hour -s /Users/rwolff/Pictures/Export -k 24 >>/var/log/cronroot.log
  # every day, run a backup to a different destination and keep 7
  2 0 * * * /usr/local/bin/node /Users/rwolff/dev/gocastmain/projects/server/backupPrune.js
            -a -d /Users/rwolff/backups/day -s /Users/rwolff/Pictures/Export -k 7 >>/var/log/cronroot.log
  # every week, run a backup to a different destination and keep 4
  3 0 * * Sun /usr/local/bin/node /Users/rwolff/dev/gocastmain/projects/server/backupPrune.js
            -a -d /Users/rwolff/backups/week -s /Users/rwolff/Pictures/Export -k 4 >>/var/log/cronroot.log
  # every month, run a backup to a different destination and keep 12
  4 0 1 * * /usr/local/bin/node /Users/rwolff/dev/gocastmain/projects/server/backupPrune.js
            -a -d /Users/rwolff/backups/month -s /Users/rwolff/Pictures/Export -k 12 >>/var/log/cronroot.log

*/


/*jslint node: true, nomen: true, white: true */
/*global test, cd, exec, pwd, rm */
'use strict';

var shelljs = require('shelljs/global');

var GoCastJS = GoCastJS || {};
GoCastJS.pad = function(num, size) {
    var s = '000000000' + num;
    return s.substr(s.length - size);
};

GoCastJS.pad2 = function(num) { return GoCastJS.pad(num, 2); };

//
// Main
//

// Pickup options
// --sourcedir, -s (defaults to '.')
// --dest, -d (defaults to '.')
// --recursive, -r (defaults to recursive)
// --keepmaxfiles, -k (only keep 'n' number of files in dest dir after archiving)
//

var argv = require('optimist')
    .usage('Archive/Backup files and prune oldest files out of destination folder.\nUsage: $0 [--sourcedir dir] [--keepmaxfiles numToKeep] [--testmode] --autoname --dest destFilename.zip')
    .default('s', '.')
    .default('a', false)
    .default('t', false)
    .demand('d')
    .boolean('a')
    .boolean('t')
    .alias('d', 'dest')
    .alias('a', 'autoname')
    .alias('s', 'sourcedir')
    .alias('k', 'keepmaxfiles')
    .alias('t', 'testmode')
    .describe('s', 'Source directory (what to backup)')
    .describe('d', 'Output file and location')
    .describe('a', 'Automatically name destination file yyyymmdd_hhmmss.zip. --dest must be directory location.')
    .describe('k', 'Keep only "n" most recent files after backup. This is to prune oldest files out.')
    .describe('t', 'Test-mode only - dont actually remove any files.')
    .argv;

var destdir,
    cur = pwd();

//console.log('Source dir: ' + argv.s);
//console.log('Destination: ' + argv.d);
//console.log('Number of files to keep: ' + argv.k);
//console.log('Present directory: ' + pwd());

//
// Validate source directory as a directory
//
if (argv.sourcedir !== '.') {
    if (!test('-d', argv.sourcedir)) {
        console.log('Error: Source directory: ' + argv.sourcedir + ' is not a directory.');
        process.exit(-1);
    }

    // Don't really care about the destination file name given. If it can't be written to, we'll get an error.
}

//
// If --autoname was used, make sure --dest is a directory and then create final name.
//
if (argv.a) {
    if (!test('-d', argv.dest)) {
        console.log('Error: --autoname was specified and therefore --dest must be a directory.');
        process.exit(-2);
    }

    destdir = argv.dest;

    var now = new Date();
    argv.dest += '/' + now.getFullYear() + GoCastJS.pad2(now.getMonth() + 1) + GoCastJS.pad2(now.getDate()) + '_' +
        GoCastJS.pad2(now.getHours()) + GoCastJS.pad2(now.getMinutes()) + GoCastJS.pad2(now.getSeconds()) + '.zip';
    argv.d = argv.dest;

    console.log('AutoName: Destination name: ' + argv.dest);
}
else {
    // Need to figure out since dest is a file now, what is the dir parent.
    destdir = argv.dest.match(/^.*\//);
    if (!destdir) {
        destdir = pwd();
    }
    else {
        destdir = destdir[0];
        // chop off the trailing '/'
        destdir = destdir.slice(0, -1);
    }

    if (!test('-d', destdir)) {
        console.log('Error: Tried to figure out parent dir of: ' + argv.dest + ' and got an errant: ' + destdir);
        process.exit(-3);
    }
}

console.log('INFO: Dest dir for pruning is: ' + destdir);

//
// Zip up
//

cd(argv.sourcedir); // Gotta do the zipping and pruning from the source-dir.
var formedCommand = 'zip --quiet -r ';

if (argv.dest.charAt(0) === '/') {
    formedCommand += argv.dest + ' ';
}
else {
    formedCommand += cur + '/' + argv.dest + ' ';
}

// Add the source directory which is now '.'
formedCommand += '.';

console.log('Prepared command for execution: ' + formedCommand);

exec(formedCommand, function(code, output) {
    if (code !== 0) {
        console.log('Zip failed. Error code=' + code + ' Err: ' + output);
    }
    else {
        //
        // Prune old files if -k was used. NOTE - this takes place in the dest directory.
        //
        cd(destdir);    // Go to dest file's associated directory - this is where we prune.
        if (argv.keepmaxfiles) {
            exec('ls -tr1', function(code, output) {
                var files = output.split('\n'),
                    len = files.length, i,
                    toKeep, toRemove;

                for (i = 0; i < len; i += 1) {
                    if (files[i] === '' || test('-d', files[i])) {
                        // Remove all blank entries and all directories.
                        files.splice(i, 1);

                        // Now we must adjust both 'i' and 'len' because of the removal.
                        i -= 1;
                        len -= 1;
                    }
                }
//                console.log('ls consolidated output of ' + files.length + ' entries: ' + files.toString());

                // Do we have enough files to remove any?
                if (files.length > argv.keepmaxfiles) {
                    toKeep = files.slice(files.length - argv.keepmaxfiles, files.length);
                    toRemove = files.slice(0, files.length - argv.keepmaxfiles);
                    if (argv.testmode) {
                        console.log('TestMode: Keeping ' + argv.keepmaxfiles + ' - keep list is:', toKeep.toString());
                        console.log('TestMode: NOT Removing (pruning) files: ' + toRemove.toString());
                    }
                    else {
                        console.log('Removing (pruning) files: ' + toRemove.toString());
                        rm(toRemove);
                    }
                }
                else {
                    console.log("No pruning necessary at this time.");
                }
            });
        }
}
});

