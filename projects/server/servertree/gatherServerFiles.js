/*jslint node: true */
'use strict';

var execFile = require('child_process').execFile;
var exec = require('child_process').exec;
var Lazy = require('lazy');
var path = require('path');
var fs = require('fs.extra');

var i, len, cmd;
var filelist = '';
var entry, stats;

if (process.argv.length > 2) {
  filelist = process.argv[2];
  console.log('Flattening to "./slash/" from: ', filelist);
}
else {
  console.log('Usage: "node gatherServerFiles.js <filelist.txt>"');
  console.log('       Will pick up all files in the list and place them in ./slash/');
  process.exit(1);
}

function CopyFileToSlash(fn, cb) {
    // Separate directory from filename so we can make sure the directory exists.
    var destdir, finaldest;

    destdir = './slash/' + path.dirname(fn);

    // Now make sure that directory exists.
    fs.mkdirRecursive(destdir, function(err) {
        if (err) {
            console.log('ERROR in mkdirp: ' + err);
            process.exit();
        }

        finaldest = destdir + '/' + path.basename(fn);

        // Now copy the file
        fs.copy(fn, finaldest, function(err) {
            if (err) {
                console.log('ERROR: Copying file: ' + fn + ' to ' + finaldest + ' Err:' + err);
                process.exit(-1);
            }

            console.log('File: ' + fn + ' complete.');
            if (cb) {
                cb();
            }
        });

    });
}

function CopyPathToSlash(fn, cb) {
    // Separate directory from filename so we can make sure the directory exists.
    var destdir;

    destdir = './slash/' + fn;
    destdir = path.normalize(destdir);

    // Now make sure that directory exists.
    fs.mkdirRecursive(destdir, function(err) {
        if (err) {
            console.log('ERROR in mkdirp: ' + err);
            process.exit();
        }

        // Now copy the file
        fs.copyRecursive(fn, destdir, function(err) {
            if (err) {
                console.log('ERROR: Copying directory: ' + fn + ' to ' + destdir + ' Err:' + err);
                process.exit(-1);
            }

            console.log('Directory: ' + fn + ' complete.');
            if (cb) {
                cb();
            }
        });

    });
}

try {
    fs.rmrfSync('./slash/');
}
catch(e) {
    console.log('ERROR: removal of ./slash/ failed. Err: ' + e);
    process.exit(2);
}

new Lazy(fs.createReadStream(filelist))
    .lines
    .forEach(function(line) {
        entry = line.toString();
        if (entry[0] !== '/' && entry[0] !== '~' && entry[0] !== '#') {
            console.log('ERROR: bad entry. All entries must start with "/" or "~". (' + entry + ')');
            process.exit(1);
        }

        entry = entry.replace(/~/g, process.env.HOME);

        if (entry !== 0 && entry !== '0' && entry[0] !== '#') {
            try {
                stats = fs.statSync(entry);

                if (stats.isFile()) {
//                    console.log('FILE: ' + entry);
                    CopyFileToSlash(entry);
                }
                else if (stats.isDirectory()) {
//                    console.log('DIRECTORY: ' + entry);
                    CopyPathToSlash(entry);
                }
                else {
                    console.log('UNKNOWN: ' + entry);
                }
            }
            catch(e) {
                console.log('ERROR: ' + e);
            }
        }
     });


