const express = require("express");

var path = require("path");
var find = require("find");

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
    res.redirect("home");
  }
);

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/index", function (req, res) {
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
app.post("/", function (req, res) {
  find.file(resDir, function (files) {
    for (let i = 0; i < files.length; i++) {
      let fileRelative = path.relative(resDir, files[i]);
      res.write(
        '<li><a href="' + fileRelative + '">' + fileRelative + "</a></li>"
      );
    }
    res.end();
  });
});


app.use(express.static(resDir + "/"));

app.listen(8000, () => {
  console.log(`Example app listening at http://localhost:8000`);
});
