var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var Sync = require('./dist/SyncNodeServer');
var app = express();
var server = http.createServer(app);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var io = socketio(server);

var defaultData = {
    loyaltyMembers: {
        '0': {
            key: '0',
            name: 'Justin Kalweit',
            phone: '8035261064',
	    note: '',
	    points: {
                '0': { key: '0', type: 'Dinner', amount: 37.50 }
            }
        },
	'1': {
            key: '1',
            name: 'Garnett  Kalweit',
            phone: '8035261118',
	    note: '',
	    points: {}
        }

    },
    employees: {
    	'0': {
		key: '0',
		name: 'Matt Meares',
		wage: 12
	}
    }
};

var syncServer = new Sync.SyncNodeServer('data', io, defaultData);
app.use('/', express.static(path.join(__dirname, 'www/')));
// console.log('path', path.join(__dirname, '../client/'));

// using this for debugging...
app.get('/data/reset', function (req, res) {
    syncServer.resetData(defaultData);
    res.send('Reset.');
});

app.get('/test', function (req, res) {
    res.send('Test response!');
});


var port = process.env.PORT || 1337;
server.listen(port, function () {
    console.log('Express is listening on %s:%s', server.address().address, server.address().port);
});
