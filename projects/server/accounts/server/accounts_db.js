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

var gcutil = require('./gcutil_node');

AWS.config.update({accessKeyId: settings.dynamodb.accessKeyId,
                    secretAccessKey: settings.dynamodb.secretAccessKey,
                    region: settings.dynamodb.awsRegion});

var argv = process.argv;

var ddb = new AWS.DynamoDB();
var theUserTable = settings.accounts.dbUserTable;
var theUserRoomTable = settings.accounts.dbUserRoomTable;
var theVisitorTable = settings.accounts.dbVisitorTable;

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
            gcutil.log('accounts_db: User table found and ready.');
//            gcutil.log('Table-result: ', data.Table);
        }
    });

}());

function dbAwsObjectRead(awsObj) {
    var outObj = {};

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
                outputObj[iter] = { S: val };
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
                outputObj[iter] = { Value: { S: val }, Action: 'PUT' };
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

function dbActivateEntry(accountName, cbSuccess, cbFailure) {
    // Basically just update the table entry with a 'validated' column.
    dbUpdateEntry(accountName, {validated: new Date().toString(), validationCode: 'Completed'}, cbSuccess, cbFailure);
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
function dbValidationReport(since) {
    var startDate = new Date(since);

    if (!since) {
        startDate = new Date(1);    // From 1970
    }

//    ddb.client.scan({TableName: theUserTable,
//                     AttributesToGet: ['email', 'creationDate', 'validated', 'firstRoomName'],
//                     }, function())

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
