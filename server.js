// server.js

// set up ======================================================================

//FOUR DIFF EJS TEMPLATES LOGIN, HOMEPAGE, SIGNUP
//CONFIG FILE IS FOR STUFF NOT PUSHING TO GITHUB
// get all the tools we need

if (process.env.NODE_ENV !== ‘production’){
require('dotenv').config({silent: true});
}
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 4000;
const MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose'); //a module for "talking" to Mongo
var passport = require('passport'); //for passwords
var flash    = require('connect-flash'); //let's user know their pw is wrong

// var watson = require('watson-developer-cloud/assistant/v2');


var morgan       = require('morgan'); //logs ever request (the gets?)
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js'); //you can .gitignore folder (module.exports into another file in the config folder)

var db

// configuration ===============================================================
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, passport, db)//parameters from module.export function;
}); // connect to our database

//app.listen(port, () => {
    // MongoClient.connect(configDB.url, { useNewUrlParser: true }, (error, client) => {
    //     if(error) {
    //         throw error;
    //     }
    //     db = client.db(configDB.dbName);
    //     console.log("Connected to `" + configDB.dbName + "`!");
    //     require('./app/routes.js')(app, passport, db);
    // });
//});

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'rcbootcamp2019a', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================
//require('./app/routes.js')(app, passport, db); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
