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

AWS.config.update({accessKeyId: settings.dynamodb.accessKeyId,
                    secretAccessKey: settings.dynamodb.secretAccessKey,
                    region: settings.dynamodb.awsRegion});

var argv = process.argv;

var ddb = new AWS.DynamoDB();
var theTable = settings.accounts.dbActivationTable;

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

    ddb.client.describeTable({TableName: theTable}, function(err, data) {
        if (err) {
            // If it doesn't exist, then we should create it.
            if (err.code === 'ResourceNotFoundException') {
                // Create the table.
                ddb.client.createTable({TableName: theTable,
                                        KeySchema: {HashKeyElement: {AttributeName: 'email', AttributeType: 'S'}},
                                        ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits: 5}}, function(err, data) {
                    if (err) {
                        errOut(err);
                    }
                    else {
                        console.log('accounts_db: Successfully inititalized New Activation Table: ' + theTable);
                    }
                });
            }
            else {
                errOut(err);
            }
        }
        else {
            console.log('accounts_db: Activation table found and ready.');

/*            ddb.client.scan({TableName: theTable,
                             ScanFilter: { entryDate:
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
}());

function dbAddEntry(accountName, validationCode, cbSuccess, cbFailure) {
    var cur = new Date();

    ddb.client.putItem({TableName: theTable,
                        Item: {email: { S: accountName},
                                entryDate: { N: cur.getTime().toString()},
                                validationCode: { S: validationCode}}}, function(err, data) {
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

function dbGetEntryByAccountName(accountName, cbSuccess, cbFailure) {
    ddb.client.getItem({TableName: theTable, Key: { HashKeyElement: { S: accountName } }}, function(err, data) {
        if (err) {
            errOut(err);
            cbFailure(err);
        }
        else {
/*            if (data.Item) {
                console.log('Got Item: ', data.Item);
            }
            else {
                console.log('Didnt find item.');
            }
*/
            cbSuccess(data);
        }
    });
}

function dbDeleteEntry(accountName, cbSuccess, cbFailure) {
    ddb.client.deleteItem({TableName: theTable, Key: {HashKeyElement: { S: accountName}}}, function(err, data) {
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

exports.AddEntry = dbAddEntry;
exports.GetEntryByAccountName = dbGetEntryByAccountName;
exports.DeleteEntry = dbDeleteEntry;
