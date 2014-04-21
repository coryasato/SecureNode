var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var csrf = require('csurf');
var helmet = require('helmet');

var configDB = require('./config/database.js');
// configuration ================================================
mongoose.connect(configDB.url);
require('./config/passport')(passport);

var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'hush'}));
app.use(csrf());
app.use(passport.initialize());
app.use(passport.session()); // persistant login sessions
app.use(flash()); //flash messages stored in session
app.use(function(req, res, next) {  // csrf security
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.locals.csrftoken = req.csrfToken();
  next();
});
// helmet security 
app.use(helmet.xframe()); // X Frame Options
app.use(helmet.hsts()); // HTTP Strict Transport Security
app.use(helmet.iexss()); // X-XSS Protection for IE8
app.use(helmet.contentTypeOptions()); // X-Content Type Options nosniff
// app.use(helmet.hidePoweredBy());  // Hides Powered by Express Header
 

// routes ======================================================
app.use('/', routes);
// app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// launch =====================================================
module.exports = app;
