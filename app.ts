"use strict";

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const model = require('./models/model');

const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

/* socket */

const http = require('http');

const socket = require('socket.io');

const server = http.createServer(app).listen(3000);

const io = socket.listen(server);


/* socket */


const config = require('config');
const binance_config = config.binance;

const binance = require('node-binance-api');

io.sockets.on('connection', function (socket) {

    var Tick = model.Tick;

    binance.options({
        APIKEY: binance_config.APIKEY,
        APISECRET: binance_config.APISECRET,
        useServerTime: true,
        test: true
    });


    let save_promise = (tick): void => {
        return new Promise((resolve, reject) => {

            let new_tick = new Tick({
                key: tick.key,
                close: tick.close,
                eventTime: tick.eventTime,
                high: tick.high,
                low: tick.low,
                open: tick.open,
                quoteVolume: tick.quoteVolume,
                volume: tick.volume
            });

            new_tick.save(function (error) {
                if (!error) {
                    resolve()
                } else {
                    reject();
                }
            });
        });
    };

    binance.websockets.miniTicker((changed) => {

        let ticks = [];
         Object.keys(changed).forEach(key => {
             let tick = changed[key];
             tick["key"] = key;
             ticks.push(tick);
         })

        Promise.all(ticks.map((tick) => {
            return save_promise(tick);
        })).then((results) => {
            io.sockets.emit('from_server', {value: changed});
        }).catch((error) => {

        });

    });

});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
