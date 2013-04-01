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
    this.writeTimeout = null;
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
        writetimeout: function() {
            return function() {
                console.log('writetimeout[info]: Writing to file "' +
                            self.file + '"...');
                self.writeTimeout = null;
                fs.writeFile(self.file, JSON.stringify(self.table), function(err) {
                    if (err) {
                        throw err;
                    } else {
                        console.log('writetimeout[info]: Writing to file "' +
                                    self.file + '"... done.');
                    }
                });
            };
        }
    };

    // actions
    this.readfromfile();
}

memdb.prototype.readfromfile = function() {
    if (this.file) {
        fs.readFile(this.file, {encoding: 'utf8'},
                    this.callbacks['fileread']());
    }
};

memdb.prototype.deferredwritetofile = function() {
    var self = this;
    periodms = periodms || 60000; // default period: 1 min

    if (this.file && !this.writeTimeout) {
        this.writeTimeout = setTimeout(this.callbacks['writetimeout'](periodms), periodms);
    }
};

memdb.prototype.addentry = function(key, entry) {
    if (entry) {
        this.table[key] = entry;
        this.deferredwritetofile();
    }
};

memdb.prototype.rementry = function(key) {
    if (key) {
        delete this.table[key];
        this.deferredwritetofile();
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