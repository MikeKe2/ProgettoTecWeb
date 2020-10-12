const express = require("express");

var path = require("path");
var find = require("find");
var fs = require("fs");

var passport = require("passport");
var Strategy = require("passport-local").Strategy;

var db = require("./db");
var app = express();

passport.use(
  new Strategy(function (username, password, cb) {
    db.users.findByUsername(username, function (err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      if (user.password != password) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  })
);

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require("morgan")("combined"));
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Create the Server
app.get("/", function (req, res) {
  res.render("home", { user: req.user });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("index");
  }
);

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/index", require('connect-ensure-login').ensureLoggedIn(), 
  function (req, res) {
    res.render("index");
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

diname = __dirname + "/admin/";
var resDirprivate = diname + "/private/";
var resDirpublic = diname + "/public/";
var resDir = __dirname + "/";

//server.js
app.post("/public",
function (req, res) {
  var filelist = [];
  var resDir = __dirname + "/users/" + req.user.username + "/public/";
  find.file(resDir, function (files) {
    for (let i = 0; i < files.length; i++) {
      let fileRelative = path.relative(resDir, files[i]);
      console.log(fileRelative);
      res.write("<li class=\"ui-widget-content\">" + fileRelative + "</li>\n");
    }
    res.end();
  });
});

app.post("/private",
function (req, res) {
  var filelist = [];
  var resDir = __dirname + "/users/" + req.user.username + "/private/";
  find.file(resDir, function (files) {
    for (let i = 0; i < files.length; i++) {
      let fileRelative = path.relative(resDir, files[i]);
      console.log(fileRelative);
      res.write("<li class=\"ui-widget-content\">" + fileRelative + "</li>\n");
    }
    res.end();
  });
});

app.post("/makeprivate", require('connect-ensure-login').ensureLoggedIn(), 
  function(req, res){
    var resDir = __dirname + "/users/" + req.user.username;
    var files = res.json(req.body.filelist);
    for(let i = 0; i<files.length; i++){
      let file = files[i];
      fs.rename(resDir + "/public/" + file, resDir + "/private/" + file);
    }
});

app.use(express.static(resDir + "/"));

app.listen(8000, () => {
  console.log(`Example app listening at http://localhost:8000`);
});
