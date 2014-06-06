var express = require('express');
var routes = require('./routes');
var http = require('http');
var bodyParser = require('body-parser');
// var faye = require('faye');
var path = require('path');
// var io = require('socket.io')(http);

var app = express();
app.use(bodyParser());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

var server = http.createServer(app);
// bayeux = new faye.NodeAdapter({mount: '/game', timeout: 45});
// bayeux.attach(server);

// all environments
app.set('port', process.env.NODE_PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.render('index');
});
app.post('/game', function (req, res, err) {
    GAMES.push(req.body);
    console.log(GAMES);
    res.send({
        data: req.body,
        message: 'Room created'
    })
})

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var GAMES = [];

var players = {};
var io = require('socket.io').listen(server);

io.on('connection', function(socket) {
    console.log('user connected', socket.id);
    players[socket.id] = {};
    console.log('CONNECTED = ', players);

    socket.on('disconnect', function() {
        socket.broadcast.emit('exit', players[socket.id].id)
        delete players[socket.id];
        console.log('DISCONNECT = ', players);
    });

    socket.on('init', function(data) {
        players[socket.id] = data; 
        socket.broadcast.emit('init', data)
        console.log('INIT = ', players);
    });
    socket.on('movement', function(data) {
        socket.broadcast.emit('movement', data);
    });
    socket.on('ammos', function(data) {
        socket.broadcast.emit('ammos', data);
    });
    socket.on('ammo exit', function(data) {
        socket.broadcast.emit('ammo exit', data);
    });

    // meta channel
    socket.on('main', function(data) {
        console.log('//// main ////');
        var id = 'test_' + data.channel;
        socket.on(id, function(data) {
            console.log(data);
        })

    })
})