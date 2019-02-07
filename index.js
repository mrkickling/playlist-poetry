// Written by Joakim Loxdal

require('dotenv').config();

const fs = require('fs');
const express = require('express');
const path = require('path');
const cookie = require('cookie');
const port = process.env.PORT;
const querystring = require('querystring');
var session = require('express-session');
var hbs = require('express-handlebars');
var SpotifyWebApi = require('spotify-web-api-node');
var sanitizeHtml = require('sanitize-html');

const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Should handle https on non-develop environment

var sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: false },
  resave: false,
  saveUninitialized: true
});

// Session settings for server
app.use(sessionMiddleware);
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// View engine settings for server
app.set('view engine', '.hbs');
app.engine('.hbs', hbs({
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views')
}));

// Other settings for server
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.set('views', __dirname + '/views')

// Start http server
http.listen(port, function(){
  console.log('listening on '+process.env.HOST);
});

// The app object we'll use to interact with the API
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET
});

// Using the Client Credentials auth flow, authenticate our app
spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log("Got access token: " + data.body['access_token'])
  }, function(err) {
    console.log('Something went wrong when retrieving an access token for app', err.message);
});
