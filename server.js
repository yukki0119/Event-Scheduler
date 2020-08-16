
// init project
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
var expressflash = require('express-flash');

const setUpPassport = require("./setuppassport");

// Establish a connection with the Mongo Database
// Get the username, password, host, and databse from the .env file
const mongoDB = ("mongodb+srv://"+
                 process.env.USERNAME+
                 ":"
                 +process.env.PASSWORD+
                 "@"
                 +process.env.HOST+
                 "/"
                 +process.env.DATABASE);

mongoose.connect(mongoDB, {useNewUrlParser: true, retryWrites: true});

//debugging 
mongoose.connection.on('connected', function (){
  console.log('Mongoose connected to '+process.env.DATABASE);
});

mongoose.connection.on('error', function (err){
  console.log('Mongoose connection error: '+err);
});

mongoose.connection.on('disconnected', function (){
  console.log('Mongoose disconnected.');
});
setUpPassport();


const app = express();
app.use(express.static(__dirname +'/public'));

//app.use(express.static("public"));
// set the view engine
app.set("view engine", "ejs")
app.set("views", __dirname + "/views/");

// Set up the session middlewayre
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Using connect-mongo for session storage
// https://www.npmjs.com/package/connect-mongo
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection, autoRemove: 'native' })
}));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(expressflash());

// Load routes
const authRouter = require("./routes/auth");
const apiRouter = require("./routes/api");

app.use("/", authRouter);
app.use("/", apiRouter);


app.use(function(req, res, next){
// if there's a flash message in the session request, make it available in the response, then delete it
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
next();
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});