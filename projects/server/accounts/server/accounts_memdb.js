/*
 * In-memory JSON database manager
 * Tables: sessions, and hpwds
 */

var fs = require('fs');

function memdb(file, onread) {
    // local variables
    var self = this;
    file = file || '';
    onread = onread || function() {};

    // member variables
    this.table = {};
    this.file = file;
    this.callbacks = {
        fileread: function() {
            return function(err, data) {
                if (err) {
                    if ('ENOENT' === err.code) {
                        fs.writeFile(self.file, '{}', function(err) {
                            if (err) {
                                throw err;
                            } else {
                                self.readfromfile();
                            }
                        });
                    } else {
                        throw err;
                    }
                } else {
                    try {
                        self.table = JSON.parse(data);
                        console.log('sync[info]: table = ', self.table);
                        onread();
                    } catch(e) {
                        throw e;
                    };
                }
            };
        },
        writetimeout: function(periodms) {
            return function() {
                console.log('writetimeout[info]: Writing to file "' +
                            self.file + '"...');
                fs.writeFile(self.file, JSON.stringify(self.table), function(err) {
                    if (err) {
                        throw err;
                    } else {
                        console.log('writetimeout[info]: Writing to file "' +
                                    self.file + '"... done.');
                    }
                    self.periodicwritetofile(periodms);
                });
            };
        }
    };

    // actions
    this.readfromfile();
    this.periodicwritetofile(1000);
}

memdb.prototype.readfromfile = function() {
    if (this.file) {
        fs.readFile(this.file, {encoding: 'utf8'},
                    this.callbacks['fileread']());
    }
};

memdb.prototype.periodicwritetofile = function(periodms) {
    var self = this;
    periodms = periodms || 60000; // default period: 1 min

    if (this.file) {
        setTimeout(this.callbacks['writetimeout'](periodms), periodms);
    }
};

memdb.prototype.addentry = function(key, entry) {
    if (entry) {
        this.table[key] = entry;
    }
};

memdb.prototype.rementry = function(key) {
    if (key) {
        delete this.table[key];
    }
};

memdb.prototype.getentry = function(key) {
    if (this.table.hasOwnProperty(key)) {
        return this.table[key];
    }
    return null;
};

// module exports
exports.memdb = memdb;