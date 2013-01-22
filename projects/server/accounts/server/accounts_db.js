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
var _ = require('underscore');

AWS.config.update({accessKeyId: settings.dynamodb.accessKeyId,
                    secretAccessKey: settings.dynamodb.secretAccessKey,
                    region: settings.dynamodb.awsRegion});

var argv = process.argv;

var ddb = new AWS.DynamoDB();
var theUserTable = settings.accounts.dbUserTable;
var theUserRoomTable = settings.accounts.dbUserRoomTable;

'use strict';

function errOut(err) {
    console.log('DynamoDB: Error: code: ' + err.code + ', message: ' + err.message);
}

(function() {
    // Make sure our table exists before we go further...
/*    ddb.client.listTables(function(err, data) {
        if (err) {
            errOut(err);
        }
        else {
            console.log('List-Results: ', data.TableNames);
        }
    });
*/
    if (!ddb) {
        console.log('ERROR: AWS.DynamoDB did not initialize properly. Exiting.');
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
                        console.log('accounts_db: Successfully inititalized New User Table: ' + theUserTable);
                    }
                });
            }
            else {
                errOut(err);
            }
        }
        else {
            console.log('accounts_db: User table found and ready.');

/*            ddb.client.scan({TableName: theUserTable,
                             ScanFilter: { creationDate:
                                            { AttributeValueList: [{N: '212345'}],
                                              ComparisonOperator: 'GT' } } }, function(err, data) {
                                    if (err) {
                                        errOut(err);
                                    }
                                    else {
                                        console.log('SCANNED and got Items: ', data.Items || data.Item);
                                        console.log('SCANNED-RAW: ', data);
                                    }
                                });
*/
//            console.log('Table-result: ', data.Table);
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
                        console.log('accounts_db: Successfully inititalized New UserRoom Table: ' + theUserRoomTable);
                    }
                });
            }
            else {
                errOut(err);
            }
        }
        else {
            console.log('accounts_db: UserRoom table found and ready.');

//            console.log('UserRoom - Table-result: ', data.Table);
        }
    });
}());

function dbAwsObjectRead(awsObj) {
    var outObj = {};

    _.each(awsObj, function(val, iter) {
//        console.log('iter: ' , iter, ', val: ', val);
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
            console.log('dbAwsObjectRead: ERROR - illegal value being skipped: name: ' + iter + ', value is: ' + JSON.stringify(val));
        }
    });

//    console.log('dbAwsObjectRead: Final object out: ' + JSON.stringify(outObj));
    return outObj;
}

function dbAwsObjectPrep(outputObj, inputObj) {
    if (typeof(outputObj) !== 'object') {
        outputObj = {};
    }

    _.each(inputObj, function(val, iter) {
//        console.log('iter: ' , iter, ', val: ', val);
        switch(typeof(val)) {
            case 'string':
                outputObj[iter] = { S: val };
                break;
            case 'number':
                outputObj[iter] = { N: val.toString() };
                break;
            case 'boolean':
                outputObj['bool_' + iter] = { N: (val ? '1' : '0')};
                break;
            default:
                console.log('dbAwsObjectPrep: ERROR - illegal value being skipped: name: ' + iter + ', value is type: ' + typeof(val));
                break;
        }
    });
}

function dbAwsUpdateObjectPrep(outputObj, inputObj) {
    if (typeof(outputObj) !== 'object') {
        outputObj = {};
    }

    _.each(inputObj, function(val, iter) {
        console.log('iter: ' , iter, ', val: ', val);
        switch(typeof(val)) {
            case 'string':
                outputObj[iter] = { Value: { S: val }, Action: 'PUT' };
                break;
            case 'number':
                outputObj[iter] = { Value: { N: val.toString() }, Action: 'PUT' };
                break;
            case 'boolean':
                outputObj['bool_' + iter] = { Value: { N: (val ? '1' : '0')}, Action: 'PUT' };
                break;
            default:
                console.log('dbAwsUpdateObjectPrep: ERROR - illegal value being skipped: name: ' + iter + ', value is type: ' + typeof(val));
                break;
        }
    });

//    console.log('dbAwsUpdateObjectPrep: output obj: ', JSON.stringify(outputObj));
}
/*
var it = {};
dbAwsObjectPrep(it, {name: 'bob', num: 1234, bIsTrue: true, bIsFalse: false});
console.log('Prepout: ' + JSON.stringify(it));

it = { inName: { S: 'bobname' }, inNum: { N: '5678' }, bool_bInTrue: { N: '1' }, bool_bInFalse: { N: '0' }};
var out = dbAwsObjectRead(it);
console.log('Readout: ' + JSON.stringify(out));
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
//                                console.log('Added Item: ', data.Attributes);
//                                console.log('Add-RAW: ', data);
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
//                                console.log('Added Item: ', data.Attributes);
                                console.log('Update-RAW: ', data);
                                cbSuccess(data);
                            }
                        });

}

function dbActivateEntry(accountName, cbSuccess, cbFailure) {
    // Basically just update the table entry with a 'validated' column.
    dbUpdateEntry(accountName, {validated: new Date().toString()}, cbSuccess, cbFailure);
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
//                console.log('Got Item: ', JSON.stringify(data.Item));
                outObj = dbAwsObjectRead(data.Item);
//                console.log('Translated object: ', JSON.stringify(outObj));
                cbSuccess(outObj);
            }
            else {
//                console.log('Didnt find item.');
                cbFailure({code: 'NoEntryFound', message: 'Requested Entry was not found in the table.'});
            }

        }
    });
}

function dbEntryExists(accountName, cbSuccess, cbFailure) {
    ddb.client.getItem({TableName: theUserTable,
                        Key: { HashKeyElement: { S: accountName.toLowerCase() } },
                        AttributesToGet: ['bogus']}, function(err, data) {
        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
            if (data.Item) {
                cbSuccess();
            }
            else {
                cbFailure({code: 'EntryNotFound', message: 'Requested Entry was not found.'});
            }

        }
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
                console.log('dbEntryHasColumn: Success: Passing back: ' + JSON.stringify(outObj));
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

function dbDeleteEntry(accountName, cbSuccess, cbFailure) {
    ddb.client.deleteItem({TableName: theUserTable, Key: {HashKeyElement: { S: accountName.toLowerCase() }}}, function(err, data) {
        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
//            console.log('Deleted Item: ', data.Attributes);
//            console.log('Deleted-RAW: ', data);
            cbSuccess(data);
        }
    });
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
//            console.log('Deleted Item: ', data.Attributes);
//            console.log('Deleted-RAW: ', data);
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
//            console.log('Deleted Item: ', data.Attributes);
//            console.log('Deleted-RAW: ', data);
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
                console.log('dbListRooms: ERROR: Incomplete query -- LastEvaluatedKey given: ' + data.LastEvaluatedKey);
                cbFailure('dbListRooms: ERROR: Incomplete query -- LastEvaluatedKey given: ' + data.LastEvaluatedKey);
            }
//            console.log('dbListRooms: outObj is: ' + JSON.stringify(outObj));
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
                                errOut(err);
                                cbFailure(err);
                            }
                            else {
//                                console.log('Added Item: ', data.Attributes);
//                                console.log('Add-RAW: ', data);
                                cbSuccess(data);
                            }
                        });

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
