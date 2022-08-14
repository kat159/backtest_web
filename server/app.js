var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var db = require('./config/db');

var usersRouter = require('./routes/users');
var backtestRouter = require('./routes/backtest');
var strategiesRouter = require('./routes/strategies');
var criteriaRouter = require('./routes/criteria');
var backtestLogsRouter = require('./routes/backtestLog');
var indicatorsRouter = require('./routes/indicators')
var stocksRouter = require('./routes/stocks');

var app = express();

var cors = require('cors');

// allow cross origin
app.use(cors());

// initialize database
db.initDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/server/users', usersRouter);
app.use('/server/backtest', backtestRouter);
app.use('/server/strategies', strategiesRouter);
app.use('/server/criteria', criteriaRouter);
app.use('/server/backtest_logs', backtestLogsRouter);
app.use('/server/indicators', indicatorsRouter);
app.use('/server/stocks', stocksRouter);

app.use(express.static(path.join(__dirname, 'build')));

// 之前的router没有触发next()，一旦上面路由满足，这个get不会触发
app.get('/*', function (req, res) {
  console.log(1111111)
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
