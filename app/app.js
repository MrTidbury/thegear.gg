var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var util = require('util');
var session = require('express-session');
var SteamStrategy = require('passport-steam');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var secure = require('express-force-https');
var isDev = process.env.NODE_ENV == 'dev';
var secrets = require('./secrets.json');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


if (isDev){
  passport.use(new SteamStrategy({
    returnURL: secrets['dev']['returnURL'],
    realm: secrets['dev']['realm'],
    apiKey: secrets['dev']['apiKey']
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
  ));
} else {
  passport.use(new SteamStrategy({
    returnURL: secrets['prod']['returnURL'],
    realm: secrets['prod']['realm'],
    apiKey: secrets['prod']['apiKey']
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
  ));
}


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({
  secret: 'thegearggbestreatakes',
  name: 'logintest',
  resave: true,
  saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());
app.use(secure);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('soon');
});

module.exports = app;
