/*jslint node: true */

settings = require('./settings');

if (!settings) {
    console.log('ERROR: settings not found. Exiting.');
    process.exit(-1);
}

if (settings.roommanager.devel) {
    console.log('DEVEL MODE is ON.');
}

if (settings.roommanager.allow_overflow) {
    console.log('Overflow allowed.');
}

console.log('\nJSON Settings Dump.');
console.log(settings);
