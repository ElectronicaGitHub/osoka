var express = require('express');
var routes = require('./routes');
var http = require('http');
var faye = require('faye');
var path = require('path');

var app = express();
var server = http.createServer(app);
bayeux = new faye.NodeAdapter({mount: '/game', timeout: 45});
bayeux.attach(server);

// all environments
app.set('port', process.env.NODE_PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

var uuidString = function() {
    return Math.random().toString(36).substring(7)
}

app.get('/', function (req, res) {
    var userID = uuidString();
    res.render('index', {
        game_session_id : userID
    });
});

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var client = new faye.Client('http://localhost:8000/game');

var players = {},
    last_id = null;

bayeux.on('unsubscribe', function(id) {
    console.log('disconnected ', id);
    client.publish('/exit', players[id].id)
    delete players[id];
    console.log('players = ', players)
})

bayeux.on('subscribe', function(id) {
    last_id = id;
    if (!players[last_id]) {
        console.log('handshaked ', id);
        players[last_id] = {};
    }
})

bayeux.on('publish', function(_id, channel, data) {
    if (channel == '/init') {
        players[last_id] = data;    
        console.log('inited players', players);
    }
})

// client.subscribe('/main', function(data) {
//     console.log('/main:' , data)
// })

// client.subscribe('/movement', function(data) {
//     console.log(' /movement:' , data)
// })

// client.subscribe('/ammos', function(data) {
//     console.log('/ammos: ', data)
// })
