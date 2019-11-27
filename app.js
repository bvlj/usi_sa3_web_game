// We're not using the commented modules but may want to later on.
const express = require('express');
// const path = require('path');
const logger = require('morgan');
// const bodyParser = require('body-parser');
const dust = require('klei-dust');
// const dustjsLinkedin = require('dustjs-linkedin');
const mongoose = require('mongoose');

const engine = require('./engine/engine.js');

const app = express();

//DB Connection
mongoose.connect('mongodb://localhost/loa', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Database connection successful');
})
.catch(err => {
    console.error('Database connection error');
});

//configure app
app.use(logger('dev'));
// app.use(bodyParser.json({strict: false}));
// app.use(bodyParser.text());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'dust');
app.set('views', __dirname + '/views');
app.engine('dust', dust.dust);


// Initialize routers here
const routers = require(__dirname + '/routes/routers');
app.use('/', routers.root);
app.use('/stats', routers.stats);


const server = app.listen(3000, function() {
    console.log('Express server listening on port ' + server.address().port);
    engine.init();
});

const io = require('socket.io')(server);

const RENDER_DISTANCE = 2000;

io.on('connection', function(socket){
    console.log('Client connected');

    let id = engine.create();
    console.log('Created player ', id);

    let worldState;

    //Retrieve whole world data once per tick
    engine.register_global(function(data) {
        worldState = data;
    });

    //Send to each player its customized view (based on RENDER_DISTANCE)
    engine.register(id, function(data) {
        let x = data.position.x;
        let y = data.position.y;

        let players = [];

        worldState.players.forEach(function(el) {
            if (Math.abs(el.position.x - x) < RENDER_DISTANCE && 
                Math.abs(el.position.y - y) < RENDER_DISTANCE) {
                players.push(el);
            }            
        });

        let resources = [];

        /* worldState.resources.forEach(function(el) {
            if (Math.abs(el.position.x - x) < RENDER_DISTANCE && 
                Math.abs(el.position.y - y) < RENDER_DISTANCE) {
                resources.push(el);
            }
        }); */

        let structures = [];

        /* worldState.structures.forEach(function(el) {
            if (Math.abs(el.position.x - x) < RENDER_DISTANCE && 
                Math.abs(el.position.y - y) < RENDER_DISTANCE) {
                structures.push(el);
            }
        }); */

        let serializedData = {
            players: players,
            resources: resources,
            structures: structures
        };
        socket.emit('drawWorld', serializedData);
    });

    socket.on('move', function(direction) {
        let dirEnum;

        switch(direction) {
            case 0:
                dirEnum = engine.DIRECTION.UP;
            break;
            case 1:
                dirEnum = engine.DIRECTION.UP_RIGHT;
            break;
            case 2:
                dirEnum = engine.DIRECTION.RIGHT;
            break;
            case 3:
                dirEnum = engine.DIRECTION.DOWN_RIGHT;
            break;
            case 4:
                dirEnum = engine.DIRECTION.DOWN;
            break;
            case 5:
                dirEnum = engine.DIRECTION.DOWN_LEFT;
            break;
            case 6:
                dirEnum = engine.DIRECTION.LEFT;
            break;
            case 7:
                dirEnum = engine.DIRECTION.UP_LEFT;
            break;
        }
        
        engine.move(id, dirEnum);
        console.log('Player ', id, ' moved ', dirEnum);
    });

    socket.emit('message', "Welcome!");
});