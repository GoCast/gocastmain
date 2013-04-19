/**
 * accounts_db - Database API for account management in conjunction with DynamoDB
 *
 * This portion is really only about adding, getting, and deleting entries of
 * email/validation-code pairs. It is not doing real account management.
 *
 **/

/*jslint node: true, nomen: true, white: true */
/*global test, exec */

var settings;

try {
    settings = require('./settings');   // Our GoCast settings JS
} catch(e) {
    settings = require('../../settings');   // Look relative ... for developers on desktops.
}

if (!settings) {
    settings = {};
}
if (!settings.accounts) {
    settings.accounts = {};
}
if (!settings.dynamodb) {
    settings.dynamodb = {};
}

var sys = require('util');
var AWS = require('aws-sdk');
var fs = require('fs');
var _ = require('underscore');
var async = require('async');

var gcutil;
try {
    gcutil = require('./gcutil_node');
} catch(e) {
    gcutil = require('../../../gocastjs/nodejs/gcutil_node');
}

AWS.config.update({accessKeyId: settings.dynamodb.accessKeyId,
                    secretAccessKey: settings.dynamodb.secretAccessKey,
                    region: settings.dynamodb.awsRegion});

var argv = process.argv;

var ddb = new AWS.DynamoDB();
var theUserTable = settings.accounts.dbUserTable;
var theUserRoomTable = settings.accounts.dbUserRoomTable;
var theVisitorTable = settings.accounts.dbVisitorTable;
var thePublicRoomTable = settings.accounts.dbPublicRoomTable;
var theAssociatedRoomTable = settings.accounts.dbAssociatedRoomTable;
var theTransactionTable = settings.accounts.dbTransactionTable;

'use strict';

function errOut(err) {
    gcutil.log('DynamoDB: Error: code: ' + err.code + ', message: ' + err.message);
}

(function() {
    // Make sure our table exists before we go further...
/*    ddb.client.listTables(function(err, data) {
        if (err) {
            errOut(err);
        }
        else {
            gcutil.log('List-Results: ', data.TableNames);
        }
    });
*/
    if (!ddb) {
        gcutil.log('ERROR: AWS.DynamoDB did not initialize properly. Exiting.');
        process.exit(-1);
    }

    ddb.client.describeTable({TableName: theUserTable}, function(err, data) {
        if (err) {
            // If it doesn't exist, then we should create it.
            if (err.code === 'ResourceNotFoundException') {
                // Create the table.
                ddb.client.createTable({TableName: theUserTable,
                                        KeySchema: {HashKeyElement: {AttributeName: 'email', AttributeType: 'S'}},
                                        ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits: 5}}, function(err, data) {
                    if (err) {
                        errOut(err);
                    }
                    else {
                        gcutil.log('accounts_db: Successfully inititalized New User Table: ' + theUserTable);
                    }
                });
            }
            else {
                errOut(err);
            }
        }
        else {
            gcutil.log('accounts_db: User table found and ready.');

/*            ddb.client.scan({TableName: theUserTable,
                             ScanFilter: { creationDate:
                                            { AttributeValueList: [{N: '212345'}],
                                              ComparisonOperator: 'GT' } } }, function(err, data) {
                                    if (err) {
                                        errOut(err);
                                    }
                                    else {
                                        gcutil.log('SCANNED and got Items: ', data.Items || data.Item);
                                        gcutil.log('SCANNED-RAW: ', data);
                                    }
                                });
*/
//            gcutil.log('Table-result: ', data.Table);
        }
    });

    ddb.client.describeTable({TableName: theUserRoomTable}, function(err, data) {
        if (err) {
            // If it doesn't exist, then we should create it.
            if (err.code === 'ResourceNotFoundException') {
                // Create the table.
                ddb.client.createTable({TableName: theUserRoomTable,
                                        KeySchema: {HashKeyElement: {AttributeName: 'email', AttributeType: 'S'},
                                                    RangeKeyElement: {AttributeName: 'room', AttributeType: 'S'}},
                                        ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits: 5}}, function(err, data) {
                    if (err) {
                        errOut(err);
                    }
                    else {
                        gcutil.log('accounts_db: Successfully inititalized New UserRoom Table: ' + theUserRoomTable);
                    }
                });
            }
            else {
                errOut(err);
            }
        }
        else {
            gcutil.log('accounts_db: UserRoom table found and ready.');

//            gcutil.log('UserRoom - Table-result: ', data.Table);
        }
    });

//
// ASSOCIATED ROOM TABLE - for recently visited and scheduled rooms for a user.
//
    ddb.client.describeTable({TableName: theAssociatedRoomTable}, function(err, data) {
        if (err) {
            // If it doesn't exist, then we should create it.
            if (err.code === 'ResourceNotFoundException') {
                // Create the table.
                ddb.client.createTable({TableName: theAssociatedRoomTable,
                                        KeySchema: {HashKeyElement: {AttributeName: 'email', AttributeType: 'S'},
                                                    RangeKeyElement: {AttributeName: 'room', AttributeType: 'S'}},
                                        ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits: 5}}, function(err, data) {
                    if (err) {
                        errOut(err);
                    }
                    else {
                        gcutil.log('accounts_db: Successfully inititalized New AssociatedRoom Table: ' + theAssociatedRoomTable);
                    }
                });
            }
            else {
                errOut(err);
            }
        }
        else {
            gcutil.log('accounts_db: AssociatedRoom table found and ready.');

//            gcutil.log('UserRoom - Table-result: ', data.Table);
        }
    });

//
// TRANSACTION TABLE - for recently visited and scheduled rooms for a user.
//
    ddb.client.describeTable({TableName: theTransactionTable}, function(err, data) {
        if (err) {
            // If it doesn't exist, then we should create it.
            if (err.code === 'ResourceNotFoundException') {
                // Create the table.
                ddb.client.createTable({TableName: theTransactionTable,
                                        KeySchema: {HashKeyElement: {AttributeName: 'email', AttributeType: 'S'},
                                                    RangeKeyElement: {AttributeName: 'id', AttributeType: 'S'}},
                                        ProvisionedThroughput: {ReadCapacityUnits: 2, WriteCapacityUnits: 4}}, function(err, data) {
                    if (err) {
                        errOut(err);
                    }
                    else {
                        gcutil.log('accounts_db: Successfully inititalized New Transaction Table: ' + theTransactionTable);
                    }
                });
            }
            else {
                errOut(err);
            }
        }
        else {
            gcutil.log('accounts_db: Transaction table found and ready.');
        }
    });

    ddb.client.describeTable({TableName: theVisitorTable}, function(err, data) {
        if (err) {
            // If it doesn't exist, then we should create it.
            if (err.code === 'ResourceNotFoundException') {
                // Create the table.
                ddb.client.createTable({TableName: theVisitorTable,
                                        KeySchema: {HashKeyElement: {AttributeName: 'email', AttributeType: 'S'}},
                                        ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits: 5}}, function(err, data) {
                    if (err) {
                        errOut(err);
                    }
                    else {
                        gcutil.log('accounts_db: Successfully inititalized New Visitor Table: ' + theVisitorTable);
                    }
                });
            }
            else {
                errOut(err);
            }
        }
        else {
            gcutil.log('accounts_db: Visitor table found and ready.');
//            gcutil.log('Table-result: ', data.Table);
        }
    });

//
// P U B L I C   R O O M   T A B L E
//
// Expected schema - hash: room, dateCreated, description
//
    ddb.client.describeTable({TableName: thePublicRoomTable}, function(err, data) {
        if (err) {
            // If it doesn't exist, then we should create it.
            if (err.code === 'ResourceNotFoundException') {
                // Create the table.
                ddb.client.createTable({TableName: thePublicRoomTable,
                                        KeySchema: {HashKeyElement: {AttributeName: 'room', AttributeType: 'S'}},
                                        ProvisionedThroughput: {ReadCapacityUnits: 3, WriteCapacityUnits: 5}}, function(err, data) {
                    if (err) {
                        errOut(err);
                    }
                    else {
                        gcutil.log('accounts_db: Successfully inititalized New Public Room Table: ' + thePublicRoomTable);
                    }
                });
            }
            else {
                errOut(err);
            }
        }
        else {
            gcutil.log('accounts_db: Public Room table found and ready.');
//            gcutil.log('Table-result: ', data.Table);
        }
    });

}());

function dbAwsObjectRead(awsObj) {
    var outObj = {}, outArr;

    if (awsObj instanceof Array) {
        outArr = [];

//        gcutil.log('Iterating the array and building a return object/array.');
        _.each(awsObj, function(val, iter) {
//            gcutil.log('array-iter: iter: ', iter, ', val: ', val);
            outArr.push(dbAwsObjectRead(val));
        });

//        gcutil.log('array-iter result: ', outArr);
        return outArr;
    }

    _.each(awsObj, function(val, iter) {
//        gcutil.log('iter: ' , iter, ', val: ', val);
        if (val.S) {
            outObj[iter] = val.S;
        }
        else if (val.N) {
            if (iter.slice(0,5) === 'bool_') {
                outObj[iter.slice(5)] = (val.N === '1' ? true : false);
            }
            else {
                outObj[iter] = parseInt(val.N, 10);
            }
        }
        else {
            gcutil.log('dbAwsObjectRead: ERROR - illegal value being skipped: name: ' + iter + ', value is: ' + JSON.stringify(val));
        }
    });

//    gcutil.log('dbAwsObjectRead: Final object out: ' + JSON.stringify(outObj));
    return outObj;
}

function dbAwsObjectPrep(outputObj, inputObj) {
    if (typeof(outputObj) !== 'object') {
        outputObj = {};
    }

    _.each(inputObj, function(val, iter) {
//        gcutil.log('iter: ' , iter, ', val: ', val);
        switch(typeof(val)) {
            case 'string':
                // We skip null/empty entries as AWS doesn't allow them.
                if (val) {
                    outputObj[iter] = { S: val };
                }
                break;
            case 'number':
                outputObj[iter] = { N: val.toString() };
                break;
            case 'boolean':
                outputObj['bool_' + iter] = { N: (val ? '1' : '0')};
                break;
            default:
                gcutil.log('dbAwsObjectPrep: ERROR - illegal value being skipped: name: ' + iter + ', value is type: ' + typeof(val));
                break;
        }
    });
}

function dbAwsUpdateObjectPrep(outputObj, inputObj) {
    if (typeof(outputObj) !== 'object') {
        outputObj = {};
    }

    _.each(inputObj, function(val, iter) {
//        gcutil.log('iter: ' , iter, ', val: ', val);
        switch(typeof(val)) {
            case 'string':
                // We skip null/empty entries as AWS doesn't allow them.
                if (val) {
                    outputObj[iter] = { Value: { S: val }, Action: 'PUT' };
                }
                break;
            case 'number':
                outputObj[iter] = { Value: { N: val.toString() }, Action: 'PUT' };
                break;
            case 'boolean':
                outputObj['bool_' + iter] = { Value: { N: (val ? '1' : '0')}, Action: 'PUT' };
                break;
            default:
                gcutil.log('dbAwsUpdateObjectPrep: ERROR - illegal value being skipped: name: ' + iter + ', value is type: ' + typeof(val));
                break;
        }
    });

//    gcutil.log('dbAwsUpdateObjectPrep: output obj: ', JSON.stringify(outputObj));
}
/*
var it = {};
dbAwsObjectPrep(it, {name: 'bob', num: 1234, bIsTrue: true, bIsFalse: false});
gcutil.log('Prepout: ' + JSON.stringify(it));

it = { inName: { S: 'bobname' }, inNum: { N: '5678' }, bool_bInTrue: { N: '1' }, bool_bInFalse: { N: '0' }};
var out = dbAwsObjectRead(it);
gcutil.log('Readout: ' + JSON.stringify(out));
*/

//
// @brief Add an entry to the table.
//
function dbAddEntry(accountName, obj, cbSuccess, cbFailure) {
    var cur = new Date(),
        Item;

    // Prep the item to be stored
    Item = { email: { S: accountName.toLowerCase() },
             creationDate: { N: cur.getTime().toString() }
           };

    dbAwsObjectPrep(Item, obj);

    ddb.client.putItem({TableName: theUserTable,
                        Item: Item}, function(err, data) {
                            if (err) {
                                errOut(err);
                                cbFailure(err);
                            }
                            else {
//                                gcutil.log('Added Item: ', data.Attributes);
//                                gcutil.log('Add-RAW: ', data);
                                cbSuccess(data);
                            }
                        });

}

function dbUpdateEntry(accountName, obj, cbSuccess, cbFailure) {
    var cur = new Date(),
        Item;

    // Prep the item to be stored
    Item = {};

    dbAwsUpdateObjectPrep(Item, obj);

    // AttributeUpdates { itemname: { Value: { S|N : '' }, Action: 'PUT' } }, itemName2: { Value: , Action }}
    ddb.client.updateItem({TableName: theUserTable,
                        Key: { HashKeyElement: { S: accountName.toLowerCase() }},
                        AttributeUpdates: Item}, function(err, data) {
                            if (err) {
                                errOut(err);
                                cbFailure(err);
                            }
                            else {
//                                gcutil.log('Added Item: ', data.Attributes);
//                                gcutil.log('Update-RAW: ', data);
                                cbSuccess(data);
                            }
                        });

}

//
// @brief Lookup an entry and return its row if successful.
//        If accountName is not found, an error is given as err.code==='NoEntryFound'
// @return JSON version of AWS object all cleaned up.
//
function dbGetEntryByAccountName(accountName, cbSuccess, cbFailure) {
    ddb.client.getItem({TableName: theUserTable, Key: { HashKeyElement: { S: accountName.toLowerCase() } }}, function(err, data) {
        var outObj;

        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
            if (data.Item) {
//                gcutil.log('Got Item: ', JSON.stringify(data.Item));
                outObj = dbAwsObjectRead(data.Item);
//                gcutil.log('Translated object: ', JSON.stringify(outObj));
                cbSuccess(outObj);
            }
            else {
//                gcutil.log('Didnt find item.');
                cbFailure({code: 'NoEntryFound', message: 'Requested Entry was not found in the table.'});
            }

        }
    });
}

function dbEntryExists(accountName, cbSuccess, cbFailure) {
    ddb.client.getItem({TableName: theUserTable,
                        Key: { HashKeyElement: { S: accountName.toLowerCase() } },
                        AttributesToGet: ['validated']}, function(err, data) {
        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
            if (data.Item) {
                cbSuccess(dbAwsObjectRead(data.Item));
            }
            else {
                cbFailure({code: 'EntryNotFound', message: 'Requested Entry was not found.'});
            }

        }
    });
}

function dbActivateEntry(accountName, cbSuccess, cbFailure) {
    dbEntryExists(accountName, function(entry) {
        if (entry.validated) {
            cbSuccess('dbActivateEntry: Already activated.');
        }
        else {
            // Basically just update the table entry with a 'validated' column.
            dbUpdateEntry(accountName, {validated: new Date().toString(), validationCode: 'Completed'}, cbSuccess, cbFailure);
        }
    }, function(err) {
        cbFailure(err);
    });
}

function dbEntryGetColumn(accountName, columnName, cbSuccess, cbFailure) {
    ddb.client.getItem({TableName: theUserTable,
                        Key: { HashKeyElement: { S: accountName.toLowerCase() } },
                        AttributesToGet: [columnName]}, function(err, data) {
        var outObj;

        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
            if (data.Item && data.Item[columnName]) {
                outObj = dbAwsObjectRead(data.Item);
                gcutil.log('dbEntryHasColumn: Success: Passing back: ' + JSON.stringify(outObj));
                cbSuccess(outObj);
            }
            else {
                cbFailure({code: 'EntryNotValidated', message: 'Requested Entry was not found or was not validated.'});
            }

        }
    });
}

function dbIsEntryValidated(accountName, cbSuccess, cbFailure) {
    dbEntryGetColumn(accountName, 'validated', cbSuccess, cbFailure);
}

function dbConvertPasswords(pwHashFn, cbSuccess, cbFailure) {
    var outItems = [],
        scanHandler, updateItem, scanObj;

    scanObj = {TableName: theUserTable,
                  Limit: 25,
                  AttributesToGet: ['email', 'password']};

    updateItem = function(item, cb) {
        if (item.password.length === 32) {
            console.log('Skipping entry likely already completed: ' + item.email + ', pw: ' + item.password);
            cb();
            return;
        }

//        console.log('Converting entry: ' + item.email);

        dbUpdateEntry(item.email,
            {password: item.hashed},      // Make the real change.
//            {password: item.password},      // Not actually making the true change but making the call.
            function(res) {
//                console.log('Itermediate success result: ', JSON.stringify(res));
                cb();
            }, function(msg) {
                var msgback = 'Update failed for: ' + item.email + ', msg: ' + msg;
                console.log(msgback);
                cb(msgback);
            });
    };

    scanHandler = function(err, data) {
        var i, len, hashed, tempobj;

        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {

            tempobj = dbAwsObjectRead(data.Items);

            len = data.Count;
            for (i = 0; i < len; i += 1) {
                // Convert
                tempobj[i].hashed = pwHashFn(tempobj[i].password);
                tempobj[i].hashedTwice = pwHashFn(tempobj[i].hashed);

                console.log('Prepping: ' + tempobj[i].email + ', pw: ' + tempobj[i].password + ', hashed: ' + tempobj[i].hashed);
            }

            console.log('Batch conversion for ' + tempobj.length + ' entries.');
            // Now update the password in each record on the main user database.
            async.eachSeries(tempobj, updateItem, function(res) {
                if (res) {
                    console.log('dbConvertPasswords: FAILURE: Result: ' + res);
                    cbFailure(res);
                    return;
                }

                outItems.push.apply(outItems, tempobj);

                if (data.LastEvaluatedKey) {
                    gcutil.log('dbConvertPasswords: Received: ' + data.Count + ' items. Continuing scan - next iteration...');
                    scanObj.ExclusiveStartKey = data.LastEvaluatedKey;

                    // Throttle to two scans per second.
                    setTimeout(function() {
                        ddb.client.scan(scanObj, scanHandler);
                    }, 500);
                }
                else {
                    gcutil.log('dbConvertPasswords: Scan complete. Found a total of: ' + outItems.length + ' items.');
                    cbSuccess(outItems);
                }
            });
        }
    };

    ddb.client.scan(scanObj, scanHandler);
}

function dbVerifyAllHashed(cbSuccess, cbFailure) {
    var numErrors = 0,
        scanHandler, scanObj;

    scanObj = {TableName: theUserTable,
                  Limit: 25,
                  AttributesToGet: ['email', 'password']};

    scanHandler = function(err, data) {
        var i, len, hashed, tempobj;

        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {

            tempobj = dbAwsObjectRead(data.Items);

            len = data.Count;
            for (i = 0; i < len; i += 1) {
                // Verify
                if (tempobj[i].password.length !== 32) {
                    console.log('Non-converted account: ' + tempobj[i].email + ', pw: ' + tempobj[i].password);
                    numErrors += 1;
                }
            }

            if (data.LastEvaluatedKey) {
                gcutil.log('dbConvertPasswords: Received: ' + data.Count + ' items. Continuing scan - next iteration...');
                scanObj.ExclusiveStartKey = data.LastEvaluatedKey;
                ddb.client.scan(scanObj, scanHandler);
            }
            else {
                gcutil.log('dbConvertPasswords: Scan complete.');
                if (!numErrors) {
                    cbSuccess();
                }
                else {
                    console.log('# of errant accounts: ' + numErrors);
                    cbFailure();
                }
            }
        }
    };

    ddb.client.scan(scanObj, scanHandler);
}

function dbShowAllAccounts(fname, cbSuccess, cbFailure) {
    var stream, scanHandler, scanObj;

    scanObj = {TableName: theUserTable,
                  Limit: 25,
                  AttributesToGet: ['email', 'password']};

    stream = fs.createWriteStream(fname);

    scanHandler = function(err, data) {
        var i, len, hashed, tempobj;

        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {

            tempobj = dbAwsObjectRead(data.Items);

            len = data.Count;
            for (i = 0; i < len; i += 1) {
                console.log('User: ' + tempobj[i].email + ', pw: ' + tempobj[i].password);
                stream.write('User: ' + tempobj[i].email + ', pw: ' + tempobj[i].password + '\n');
            }

            if (data.LastEvaluatedKey) {
                gcutil.log('dbConvertPasswords: Received: ' + data.Count + ' items. Continuing scan - next iteration...');
                scanObj.ExclusiveStartKey = data.LastEvaluatedKey;
                ddb.client.scan(scanObj, scanHandler);
            }
            else {
                gcutil.log('dbConvertPasswords: Scan complete.');
                stream.write('Dump of user database complete.');
                stream.end();
                cbSuccess();
            }
        }
    };

    stream.once('open', function(fd) {
      stream.write('Dump of user database on: ' + new Date().toString() + '\n');

      ddb.client.scan(scanObj, scanHandler);
    });
}

function dbDeleteEntry(accountName, cbSuccess, cbFailure) {
    ddb.client.deleteItem({TableName: theUserTable, Key: {HashKeyElement: { S: accountName.toLowerCase() }}}, function(err, data) {
        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
//            gcutil.log('Deleted Item: ', data.Attributes);
//            gcutil.log('Deleted-RAW: ', data);
            cbSuccess(data);
        }
    });
}

//
// @param since - Date() object for when the report should be started - null means no filter
//
function dbValidationReport(since, cbSuccess, cbFailure) {
    var startDate = new Date(since),
        outItems = [],
        scanHandler, scanObj;

    if (!since) {
        startDate = new Date(1);    // From 1970
    }

    scanObj = {TableName: theUserTable,
                 AttributesToGet: ['email', 'creationDate', 'validated', 'firstRoomName', 'utm_source', 'utm_campaign'],
                 Limit: 8,
                 ScanFilter: { creationDate: {AttributeValueList: [{N: since.toString()}], ComparisonOperator: 'GE'}}
                 };

    scanHandler = function(err, data) {
        if (err) {
            gcutil.log('dbValidationReport: ERROR: ', err);
            cbFailure(err);
        }
        else {
            if (data.LastEvaluatedKey) {
                gcutil.log('Received: ' + data.Count + ' items. Continuing scan - next iteration...');
                outItems.push.apply(outItems, dbAwsObjectRead(data.Items));

                scanObj.ExclusiveStartKey = data.LastEvaluatedKey;
                ddb.client.scan(scanObj, scanHandler);
            }
            else {
                outItems.push.apply(outItems, dbAwsObjectRead(data.Items));

                gcutil.log('Scan complete. Found a total of: ' + outItems.length + ' items.');
                cbSuccess(outItems);
            }
        }
     };

    ddb.client.scan(scanObj, scanHandler);

}

function dbDeleteRoom(accountName, roomName, cbSuccess, cbFailure) {
    ddb.client.deleteItem({TableName: theUserRoomTable,
                           Key: {HashKeyElement: { S: accountName.toLowerCase() },
                                 RangeKeyElement: { S: roomName }}}, function(err, data) {
        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
//            gcutil.log('Deleted Item: ', data.Attributes);
//            gcutil.log('Deleted-RAW: ', data);
            cbSuccess(data);
        }
    });
}

function dbListRooms(accountName, cbSuccess, cbFailure) {
    var outObj;

    ddb.client.query({TableName: theUserRoomTable,
                      HashKeyValue: { S: accountName.toLowerCase() },
                      AttributesToGet: ['room']},
    function(err, data) {
        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
//            gcutil.log('Deleted Item: ', data.Attributes);
//            gcutil.log('Deleted-RAW: ', data);
            outObj = [];

            _.each(data.Items, function(val, iter) {
                if (val.room) {
                    outObj[iter] = val.room.S;
                }
                else {
                    outObj[iter] = 'BAD: No_Room_Returned';
                }
            });

            if (data.LastEvaluatedKey) {
                gcutil.log('dbListRooms: ERROR: Incomplete query -- LastEvaluatedKey given: ' + data.LastEvaluatedKey);
                cbFailure('dbListRooms: ERROR: Incomplete query -- LastEvaluatedKey given: ' + data.LastEvaluatedKey);
            }
//            gcutil.log('dbListRooms: outObj is: ' + JSON.stringify(outObj));
            if (outObj.length) {
                cbSuccess(outObj, data);
            }
            else {
                cbFailure('dbListRooms: ERROR: NoRoomsFound');
            }
        }
    });
}

function dbCreateRoom(accountName, roomName, cbSuccess, cbFailure) {
    var cur = new Date(),
        Item = {}, obj;

    // Prep the item to be stored
    obj = { email: accountName.toLowerCase(),
            room: roomName,
            creationDate: cur.getTime(),
            creationDateString: cur.toString()
           };

    dbAwsObjectPrep(Item, obj);

    ddb.client.putItem({TableName: theUserRoomTable,
                        Item: Item,
                        Expected: {email: {Exists: false} }}, function(err, data) {
                            if (err) {
//                                errOut(err);
                                cbFailure(err);
                            }
                            else {
//                                gcutil.log('Added Item: ', data.Attributes);
//                                gcutil.log('Add-RAW: ', data);
                                cbSuccess(data);
                            }
                        });

}

function dbVisitorEntryGetColumn(accountName, columnName, cbSuccess, cbFailure) {
    ddb.client.getItem({TableName: theVisitorTable,
                        Key: { HashKeyElement: { S: accountName.toLowerCase() } },
                        AttributesToGet: [columnName]}, function(err, data) {
        var outObj;

        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
            if (data.Item && data.Item[columnName]) {
                outObj = dbAwsObjectRead(data.Item);
//                gcutil.log('dbVisitorEntryGetColumn: Success: Passing back: ' + JSON.stringify(outObj));
                cbSuccess(outObj);
            }
            else {
                cbFailure({code: 'EntryNotValidated', message: 'Requested Entry was not found or was not validated.'});
            }

        }
    });
}

function dbVisitorSeenAgain(accountName, nickName, cbSuccess, cbFailure) {
    var cur = new Date(),
        Item, obj, numVisits;

    // First must get the # visits so far.
    dbVisitorEntryGetColumn(accountName, 'numVisits', function(data) {
//        gcutil.log('Got column: ', data);
        numVisits = data.numVisits + 1;
//        gcutil.log('After numVisits++ is: ' + numVisits);

        // Prep the item to be stored
        Item = {};
        obj = {numVisits: numVisits,
               lastNickname: nickName,
               lastSeenDate: new Date().getTime()};

        dbAwsUpdateObjectPrep(Item, obj);

        // AttributeUpdates { itemname: { Value: { S|N : '' }, Action: 'PUT' } }, itemName2: { Value: , Action }}
        ddb.client.updateItem({TableName: theVisitorTable,
                            Key: { HashKeyElement: { S: accountName.toLowerCase() }},
                            AttributeUpdates: Item}, function(err, data) {
                                if (err) {
                                    errOut(err);
                                    cbFailure(err);
                                }
                                else {
    //                                gcutil.log('Added Item: ', data.Attributes);
//                                    gcutil.log('Visitor-Update-RAW: ', data);
                                    cbSuccess(data);
                                }
                            });
    }, function(err) {
        gcutil.log('dbVisitorSeenAgain: dbVisitorEntryGetColumn failed: ', err);
        cbFailure('dbVisitorSeenAgain: dbVisitorEntryGetColumn failed: ' + err);
    });

}

function dbVisitorSeen(accountName, nickName, cbSuccess, cbFailure) {
    var cur = new Date(),
        Item = {}, obj;

    // Prep the item to be stored
    obj = { email: accountName.toLowerCase(),
            lastNickname: nickName,
            numVisits: 1,
            creationDate: cur.getTime(),
            creationDateString: cur.toString()
           };

    dbAwsObjectPrep(Item, obj);

    //
    // Try creating a new entry. If the entry already exists, then we'll
    // have to update the existing entry instead.
    //
    ddb.client.putItem({TableName: theVisitorTable,
                        Item: Item,
                        Expected: {email: {Exists: false} }}, function(err, data) {
                            if (err) {
                                errOut(err);
//                                cbFailure(err);
                                dbVisitorSeenAgain(accountName, nickName, cbSuccess, cbFailure);
                            }
                            else {
//                                gcutil.log('Added Item: ', data.Attributes);
//                                gcutil.log('Add-RAW: ', data);
                                cbSuccess(data);
                            }
                        });

}

//
// Full table scan giving back an array of objects which are the rooms
//
function dbGetPublicRooms(cbSuccess, cbFailure) {
    var outItems = [],
        scanHandler, scanObj;

    scanObj = {TableName: thePublicRoomTable,
//                 AttributesToGet: ['email', 'creationDate', 'validated', 'firstRoomName', 'utm_source', 'utm_campaign'],
                 Limit: 8
                 };

    scanHandler = function(err, data) {
        if (err) {
            gcutil.log('dbGetPublicRooms: ERROR: ', err);
            cbFailure(err);
        }
        else {
            outItems.push.apply(outItems, dbAwsObjectRead(data.Items));

            if (data.LastEvaluatedKey) {
//                gcutil.log('dbGetPublicRooms: Received: ' + data.Count + ' items. Continuing scan - next iteration...');
                scanObj.ExclusiveStartKey = data.LastEvaluatedKey;
                ddb.client.scan(scanObj, scanHandler);
            }
            else {
//                gcutil.log('dbGetPublicRooms: Scan complete. Found a total of: ' + outItems.length + ' items.');
                cbSuccess(outItems);
            }
        }
     };

    ddb.client.scan(scanObj, scanHandler);

}

function dbGetAssociatedRooms(accountName, cbSuccess, cbFailure) {
    var outItems = [],
        queryHandler, queryObj;


    queryObj = {TableName: theAssociatedRoomTable,
//                  Limit: 3,
                  HashKeyValue: { S: accountName.toLowerCase() },
                  AttributesToGet: ['room', 'roomtype', 'owner', 'lastEntry']};

    queryHandler = function(err, data) {
        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {

            outItems.push.apply(outItems, dbAwsObjectRead(data.Items));

            if (data.LastEvaluatedKey) {
                gcutil.log('dbGetAssociatedRooms: Received: ' + data.Count + ' items. Continuing scan - next iteration...');
                queryObj.ExclusiveStartKey = data.LastEvaluatedKey;
                ddb.client.query(queryObj, queryHandler);
            }
            else {
                gcutil.log('dbGetAssociatedRooms: Scan complete. Found a total of: ' + outItems.length + ' items.');
                cbSuccess(outItems);
            }
        }
    };

    ddb.client.query(queryObj, queryHandler);

}

function dbAddAssociatedRoom(accountName, room, owner, roomtype, cbSuccess, cbFailure) {
    var cur = new Date(),
        Item, obj;

    // First must get the # visits so far.
        // Prep the item to be stored
        Item = {};
        obj = { lastEntry: new Date().toString() };

        if (owner) {
            obj.owner = owner;
        }

        if (roomtype) {
            obj.roomtype = roomtype;
        }

        dbAwsUpdateObjectPrep(Item, obj);

        // AttributeUpdates { itemname: { Value: { S|N : '' }, Action: 'PUT' } }, itemName2: { Value: , Action }}
        ddb.client.updateItem({TableName: theAssociatedRoomTable,
                            Key: { HashKeyElement: { S: accountName.toLowerCase() },
                                    RangeKeyElement: { S: room }},
                            AttributeUpdates: Item}, function(err, data) {
                                if (err) {
                                    errOut(err);
                                    cbFailure(err);
                                }
                                else {
    //                                gcutil.log('Added Item: ', data.Attributes);
//                                    gcutil.log('Visitor-Update-RAW: ', data);
                                    cbSuccess(data);
                                }
                            });

}

function dbAddAssociatedRecentRoom(accountName, room, owner, cbSuccess, cbFailure) {
    return dbAddAssociatedRoom(accountName, room, owner, 'recent', cbSuccess, cbFailure);
}

function dbDeleteAssociatedRoom(accountName, roomName, cbSuccess, cbFailure) {
    ddb.client.deleteItem({TableName: theAssociatedRoomTable,
                           Key: {HashKeyElement: { S: accountName.toLowerCase() },
                                 RangeKeyElement: { S: roomName }}}, function(err, data) {
        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
//            gcutil.log('Deleted Item: ', data.Attributes);
//            gcutil.log('Deleted-RAW: ', data);
            cbSuccess(data);
        }
    });
}

//
// Store: hash: account -- rangekey: id -- must be no other pair of these or this will fail.
//
// Additionally:
//  entryDate: new Date()
//  txn_type
//  payer_email
//  payer_id
//  full_ipn -- The full JSON.stringify(body)
//
function dbStoreTransaction(accountName, id, body, cbSuccess, cbFailure) {
    var cur = new Date(),
        Item, obj;

    // First must get the # visits so far.
        // Prep the item to be stored
        Item = {};
        obj = {
            email: accountName,
            id: id,
            entryDate: new Date().toString(),
            txn_type: body.txn_type,
            payer_email: body.payer_email,
            payer_id: body.payer_id,
            full_ipn: JSON.stringify(body)
        };

        dbAwsObjectPrep(Item, obj);

        ddb.client.putItem({TableName: theTransactionTable, Item: Item, Expected: {email: {Exists: false} }},
                function(err, data) {
                    if (err) {
                        if (err.statusCode === 400 && err.code === 'ConditionalCheckFailedException') {
                            console.log('StoreTransaction: ERROR: account/id pair exists already: ',
                                        accountName, " / ", id, ', entry is: ', data);
                        }
                        else {
                            errOut(err);
                        }
                        cbFailure(err);
                    }
                    else {
                        gcutil.log('StoreTransaction: Added Transaction for: ', accountName, ' / ', id);
//                        gcutil.log('Visitor-Update-RAW: ', data);
                        cbSuccess(data);
                    }
                });

}

function dbGetAccountTransactions(accountName, cbSuccess, cbFailure) {
    var outItems = [],
        queryHandler, queryObj;


    queryObj = {TableName: theTransactionTable,
//                  Limit: 3,
                  HashKeyValue: { S: accountName.toLowerCase() }};

    queryHandler = function(err, data) {
        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {

            outItems.push.apply(outItems, dbAwsObjectRead(data.Items));

            if (data.LastEvaluatedKey) {
//                gcutil.log('dbGetAssociatedRooms: Received: ' + data.Count + ' items. Continuing scan - next iteration...');
                queryObj.ExclusiveStartKey = data.LastEvaluatedKey;
                ddb.client.query(queryObj, queryHandler);
            }
            else {
//                gcutil.log('dbGetAssociatedRooms: Scan complete. Found a total of: ' + outItems.length + ' items.');
                cbSuccess(outItems);
            }
        }
    };

    ddb.client.query(queryObj, queryHandler);
}

exports.AddEntry = dbAddEntry;
exports.UpdateEntry = dbUpdateEntry;
exports.GetEntryByAccountName = dbGetEntryByAccountName;
exports.DeleteEntry = dbDeleteEntry;
exports.IsEntryValidated = dbIsEntryValidated;
exports.EntryExists = dbEntryExists;
exports.ActivateEntry = dbActivateEntry;
exports.CreateRoom = dbCreateRoom;
exports.DeleteRoom = dbDeleteRoom;
exports.ListRooms = dbListRooms;
exports.VisitorSeen = dbVisitorSeen;
exports.ValidationReport = dbValidationReport;
exports.GetPublicRooms = dbGetPublicRooms;
exports.GetAssociatedRooms = dbGetAssociatedRooms;
exports.AddAssociatedRoom = dbAddAssociatedRoom;
exports.AddAssociatedRecentRoom = dbAddAssociatedRecentRoom;
exports.DeleteAssociatedRoom = dbDeleteAssociatedRoom;
exports.ConvertPasswords = dbConvertPasswords;
exports.ShowAllAccounts = dbShowAllAccounts;
exports.VerifyAllHashed = dbVerifyAllHashed;
exports.StoreTransaction = dbStoreTransaction;
exports.GetAccountTransactions = dbGetAccountTransactions;
