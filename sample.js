var http = require('http');
var express = require('express');
var Session = require('express-session');
var google = require('googleapis');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;
const ClientId = "249378930184-l1tm7li420n15ojhqiop9ld55pi3l9ep.apps.googleusercontent.com";
const ClientSecret = "7hoFhFtfh6USU-edOKld5ob3";
const RedirectionUrl = "http://swiftjobspro.com:3000/oauthCallback";
 
var app = express();
app.use(Session({
    secret: 'raysources-secret-19890913007',
    resave: true,
    saveUninitialized: true
}));
 
function getOAuthClient () {
    return new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
}
 
function getAuthUrl () {
    var oauth2Client = getOAuthClient();
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    var scopes = [
      'https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'
    ];
 
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes // If you only need one scope you can pass it as string
    });
 
    return url;
}
 
app.use("/oauthCallback", function (req, res) {
    var oauth2Client = getOAuthClient();
    var session = req.session;
    var code = req.query.code;

    oauth2Client.getToken(code, function(err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if(!err) {
        oauth2Client.setCredentials(tokens);
        session["tokens"]=tokens;

      res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.write("<p>Login Successful</p> <br/><a href='/details'>GO to Details Page</a>");
  res.end();

	}
      else{
        res.send(`
            &lt;h3&gt;Login failed!!&lt;/h3&gt;
        `);
      }
    });
});
 
app.use("/details", function (req, res) {
    var oauth2Client = getOAuthClient();
    oauth2Client.setCredentials(req.session["tokens"]);
console.log('Hi');
console.log(req.session["tokens"]);

    var p = new Promise(function (resolve, reject) {
        plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
            resolve(response || err);
        });
    }).then(function (data) {
        res.send(`
            &lt;img src=${data.image.url} /&gt;
            &lt;h3&gt;Hello ${data.displayName}&lt;/h3&gt;
        `);
    })
});
 
app.use("/", function (req, res) {
    var url = getAuthUrl();
res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.write("<p>Authentication using Google oAuth</p> <br/><a href="+url+">Login With Google</a>");
  res.end();
});
 
 
var port = 3000;
var server = http.createServer(app);
server.listen(port);
server.on('listening', function () {
    console.log(`listening to ${port}`);
});
 
