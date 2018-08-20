var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var handlebar = require('express-handlebars');
var mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');

var store = require('connect-mongo')(session);

var app = express();
mongoose.connect('mongodb://localhost:27017/website',{ useNewUrlParser: true } );
require('./config/passport');
// view engine setup
//app.engine('.hbs', handlebar({defaultLayout: 'layout', extname: '.hbs'}));

app.set('view engine', '.hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'xyz',
    resave: false,
    saveUninitialized: false,
    store: new store({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 60*60*1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false}));
app.use(validator());

app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});


app.use('/', indexRouter);

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
