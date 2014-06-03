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
    return Math.random().toString(36).substring(2,13)
}
// генерим айди для персонажа и отправляем на клиент
// пока что не понятно нахуя...прост))))))))))))))))
app.get('/', function (req, res) {
    var userID = uuidString();
    res.render('index', {
        game_session_id : userID
    })
});

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var client = new faye.Client('http://localhost:8000/game');

bayeux.on('disconnect', function(id) {
    console.log('disconnected ', id)
})

bayeux.on('handshake', function(id) {
    console.log('handshaked with ', id)
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
