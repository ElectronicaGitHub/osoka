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
var io = require('socket.io').listen(server);
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

app.get('/games/all', function (req, res, err) {
    res.json(GAMES);
})
app.post('/game', function (req, res, err) {
    GAMES.push(req.body);
    console.log(GAMES);
    res.send({
        data: req.body,
        message: 'Game created'
    })
    io.emit('games', GAMES);
})
app.get('/game/:game_id', function (req, res, err) {
    var data = GAMES[req.params.game_id];
    res.json(data);
})
app.post('/game/player/add', function (req, res, err) {
    console.log('add')
    var data = req.body;
    var side = data.side; 
    var player_name = data.player_name; 
    var game_id = data.game_id;
    var client_id = data.client_id;

    for (i in GAMES) {
        if (GAMES[i].id == game_id) {
            GAMES[i].players[side][client_id] = {
                player_name : player_name
            }
            console.log('Player added ', GAMES[i]);
            io.emit('games', GAMES);
        }
    }
    res.json(GAMES[i])
})
app.post('/game/player/remove', function (req, res, err) {
    console.log('remove')
    var data = req.body;
    var side = data.side; 
    var player_name = data.player_name; 
    var game_id = data.game_id;
    var client_id = data.client_id;

    for (i in GAMES) {
        if (GAMES[i].id == game_id) {
            delete GAMES[i].players[side][client_id];
        }
    }
    io.emit('games', GAMES);
    res.json(GAMES[i]);

})

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var GAMES = [];

var players = {};

io.on('connection', function(socket) {


    console.log('user connected', socket.id);
    players[socket.id] = {};
    console.log('CONNECTED = ', players);

    socket.on('disconnect', function() {
        socket.broadcast.emit('exit', players[socket.id].id)
        delete players[socket.id];
        console.log('DISCONNECT = ', players);
    });

    socket.on('games', function(data) {
        socket.emit('games', GAMES);
    })

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