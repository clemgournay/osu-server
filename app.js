require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const passport = require('./src/middleware/auth');
const config = require('./src/config');

const app = express();

app.use(cookieParser('tkeovne'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'tkeovne',
    resave: false,
    saveUninitialized: false,
    cookie: {
      SameSite: false,
      maxAge: 60 * 60 * 24 * 1000
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', config.APP_DOMAIN);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

mongoose.connect(`mongodb://localhost:3001/osu-server`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});
const db = mongoose.connection;

if(!db)
  console.log('Error connecting db')
else
  console.log('Db connected successfully')

const router = require('./src/router');
app.use(router);

app.post('/auth', passport.authenticate('local'), function(req, res){
  console.log('passport user', req.user);
});

// Create http server and run it
const server = http.createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log('Express server running on *:' + port);
});