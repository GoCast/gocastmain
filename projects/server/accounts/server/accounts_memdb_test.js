var memdb = require('./accounts_memdb').memdb;

var dbwithoutfile = new memdb();
var dbwithfile = new memdb('./testdb.json', function() {
    // ------- testing database with file -------
    console.log('test 1: dbwithfile.addentry("key0", {field0: "x", field1: "y"});');
    dbwithfile.addentry('key0', {field0: 'x', field1: 'y'});
    console.log('result: ', dbwithfile.table);

    console.log('test 2: dbwithfile.addentry("key1", {field0: "a", field1: "b"});');
    dbwithfile.addentry('key1', {field0: 'a', field1: 'b'});
    console.log('result: ', dbwithfile.table);

    console.log('test 3: dbwithfile.rementry("key0");');
    dbwithfile.rementry('key0');
    console.log('result: ', dbwithfile.table);

    console.log('test 4: dbwithoutfile.addentry("key0", {field0: "x", field1: "y"});');
    dbwithoutfile.addentry('key0', {field0: 'x', field1: 'y'});
    console.log('result: ', dbwithfile.table);

    console.log('test 5: dbwithoutfile.addentry("key1", {field0: "a", field1: "b"});');
    dbwithoutfile.addentry('key1', {field0: 'a', field1: 'b'});
    console.log('result: ', dbwithfile.table);

    setInterval(function() {}, 1000);
});
