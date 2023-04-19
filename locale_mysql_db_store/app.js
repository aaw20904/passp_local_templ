require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let passport = require('passport');
let session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const storeOptions = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '65535258',
	database: 'mainbase'
};



var indexRouter = require('./routes/index');
var authRouter =require('./routes/auth');

var app = express();

//app.locals.pluralize = require('pluralize');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//storage for session

app.use(session({
    cookie: { maxAge:60000*60 /*mS*/},
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store:   new MySQLStore(storeOptions)
}));

app.use(passport.authenticate('session'));

app.use('/', indexRouter);

app.use('/',authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  //duplicate username error
  if (err.code === 'ER_DUP_ENTRY') {
    res.render('exists.ejs');
    return;
  }
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000,()=>{console.log('listen...')});
module.exports = app;
