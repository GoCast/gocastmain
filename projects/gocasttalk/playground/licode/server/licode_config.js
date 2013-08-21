var config = {}

config.rabbit = {};
config.nuve = {};
config.erizoController = {};
config.cloudProvider = {};
config.erizo = {};

config.rabbit.host = 'localhost';
config.rabbit.port = 5672;

config.nuve.dataBaseURL = "localhost/nuvedb";
config.nuve.superserviceID = '520abff6682aa5fcd2a3637e';
config.nuve.superserviceKey = '7961';
config.nuve.testErizoController = 'localhost:8080';

//Use undefined to run clients without Stun 
config.erizoController.stunServerUrl = 'stun:stun.l.google.com:19302';
config.erizoController.warning_n_rooms = 15;
config.erizoController.limit_n_rooms = 20;
config.erizoController.interval_time_keepAlive = 1000;

//STUN server IP address and port to be used by the server.
//if '' is used, the address is discovered locally
config.erizo.stunserver = '';
config.erizo.stunport = 0;

//note, this won't work with all versions of libnice. With 0 all the available ports are used
config.erizo.minport = 0;
config.erizo.maxport = 0;

config.cloudProvider.name = 'amazon';
//In Amazon Ec2 instances you can specify the zone host. By default is 'ec2.us-east-1a.amazonaws.com' 
config.cloudProvider.host = 'ec2.us-west-1.amazonaws.com';
config.cloudProvider.accessKey = 'AKIAJPLGSHBJ6KPT4KVA';
config.cloudProvider.secretAccessKey = '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';

module.exports = config;
