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

// all environments
app.set('port', process.env.NODE_PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/games/all', function (req, res, err) {
    for (i in GAMES) {
        GAMES[i] = gameInformer(GAMES[i])
    }
    res.json(GAMES);
})
app.post('/game', function (req, res, err) {
    GAMES.push(req.body);
    console.log(GAMES);
    res.send({
        data: req.body,
        message: 'Game created'
    })
    for (i in GAMES) {
        GAMES[i] = gameInformer(GAMES[i]);
    }
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
    var other_side = (side == 0) ? 1 : 0; 
    console.log(side, other_side);
    var player_name = data.player_name; 
    var game_id = data.game_id;
    var client_id = data.client_id;

    for (i in GAMES) {
        if (GAMES[i].id == game_id) {
            delete GAMES[i].players[other_side][client_id];
            GAMES[i].players[side][client_id] = {
                player_name : player_name,
                player_side : side
            }
            console.log('Player added ', GAMES[i]);
        }
        GAMES[i] = gameInformer(GAMES[i]);
    }
    io.emit('games', GAMES);
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
        GAMES[i] = gameInformer(GAMES[i]);
    }

    io.emit('games', GAMES);
    res.json(GAMES[i]);
})

function gameInformer(game) {
    if (game) {
        game.max_players = game.players_per_team * 2;
        game.team_0_length = Object.keys(game.players[0]).length;
        game.team_1_length = Object.keys(game.players[1]).length;
        
        if ((game.team_0_length + game.team_1_length) == game.max_players) {
            game.teams_ready = true;
        } else {
            game.teams_ready = false;
        }
        return game;
    }
}

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var GAMES = [];
var players_global = {};

// main connect
io.on('connection', function(socket) {
    console.log('user connected', socket.id);
    // players[socket.id] = {};

    socket.on('games', function(data) {
        socket.emit('games', GAMES);
    })
    socket.on('disconnect', function() {
        console.log('disconnected', socket.id);    
    })

    // each game connects
    socket.on('game main', function(game_id) {

        socket.on('disconnect', function() {
            socket.broadcast.emit('exit ' + game_id, players_global[socket.id].id)
            delete players_global[socket.id];
            console.log('disconnect one, players = ', players_global);
        });
        socket.on('init ' + game_id, function(data) {
            players_global[socket.id] = data; 
            socket.broadcast.emit('init ' + game_id, data)
            console.log('INIT = ', players_global);
        });
        socket.on('movement ' + game_id, function(data) {
            socket.broadcast.emit('movement ' + game_id, data);
        });
        socket.on('ammos ' + game_id, function(data) {
            socket.broadcast.emit('ammos ' + game_id, data);
        });
        socket.on('ammo exit ' + game_id, function(data) {
            socket.broadcast.emit('ammo exit ' + game_id, data);
        });
    })
})