const express = require("express");

var app = express();

var path = require("path");
var find = require("find");
var fs = require("fs");
var https = require("https");

var passport = require("passport");
var Strategy = require("passport-local").Strategy;

var db = require("./db");
const {
  json
} = require("body-parser");
var app = express();

var multer = require('multer');
var uploader = multer({
  dest: 'uploads/'
});

const server = require('https').createServer({
  key: fs.readFileSync(__dirname + '/https/server.key'),
  cert: fs.readFileSync(__dirname + '/https/server.cert')
}, app);
const io = require('socket.io')(server);

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
//app.use(require("morgan")("combined"));
app.use(require("body-parser").urlencoded({
  extended: true
}));
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//HOME
app.get("/", function (req, res) {
  res.render("home", {
    user: req.user
  });
});

//LOGIN
app.get("/login", function (req, res) {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login"
  }),
  function (req, res) {
    res.redirect("index");
  }
);

//LOGOUT
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});


//INDEX
app.get("/index", require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    res.render("index");
  }
);


//PROFILE
app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    res.render('profile', {
      user: req.user
    });
  });

//PLAYER INTERFACE
app.use(express.static(path.join(__dirname, 'public/Player')))
app.get('/start', function(req, res){
  res.sendFile(__dirname + "/public/Player/index.html");
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
        res.write("<li class=\"ui-widget-content\" style=\"overflow: hidden;\" name=\"" + fileRelative + "\">" + fileRelative +
          "<button class=\"ui-button ui-widget ui-corner-all ui-button-icon-only\" style=\"float: right;\" onclick=\"gotoEditor('" +
          fileRelative + "', 'public')\"><span class=\"ui-icon ui-icon-pencil\"></span></button></li>\n");
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
        res.write("<li class=\"ui-widget-content\" style=\"overflow: hidden;\" name=\"" + fileRelative + "\">" + fileRelative +
          "<button class=\"ui-button ui-widget ui-corner-all ui-button-icon-only\" style=\"float: right;\" onclick=\"gotoEditor('" +
          fileRelative + "', 'private')\"><span class=\"ui-icon ui-icon-pencil\"></span></button></li>\n");
      }
      res.end();
    });
  });

app.post("/makeprivate", require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var resDir = __dirname + "/users/" + req.user.username;
    var filelist = req.body.files;
    console.log(filelist);
    for (let i = 0; i < filelist.length; i++) {
      let file = filelist[i];
      console.log(file);
      fs.renameSync(resDir + "/public/" + file, resDir + "/private/" + file);
    }
  });

app.post("/makepublic", require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var resDir = __dirname + "/users/" + req.user.username;
    var filelist = req.body.files;
    console.log(filelist);
    for (let i = 0; i < filelist.length; i++) {
      let file = filelist[i];
      console.log(file);
      fs.renameSync(resDir + "/private/" + file, resDir + "/public/" + file);
    }
  });


// Check File Type
function checkFileType(file, cb) { //la funzione per controllare se i file sono corretti ma mi sembra inutile. la tengo che non si sa mai 
  // Allowed ext
  let filetypes;
  switch (type) {
    case "images":
      filetypes = /jpeg|jpg|png|gif/;
      break;
    case "audios":
      filetypes = /mp3|wav|ogg/;
      break;
    case "widgets":
      filetypes = /html/;
      break;
    case "stories":
      filetypes = /mms/;
      break;
  }
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: ' + type + ' Only!');
  }
}



function getMedia(req, res, type) {
  //passing directoryPath and callback function
  const directoryPath = path.join(__dirname + "/users/" + req.user.username, type);
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    let filelist = [];
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      console.log(file);
      filelist.push(file);
    });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(filelist));
    res.end();
  });
}

function postMedia(req, res, type) {
  let upload = multer({
    storage: multer.diskStorage({
      destination: './users/' + req.user.username + '/' + type + '/',
      filename: function (req, file, cb) {
        while (!fs.existsSync(path.join(docfolder, file.originalname))) {
          file.originalname += "_new";
        }
        cb(null, file.originalname);
      }

    }),
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb, type);
    }
  }).single("my_" + type);

  upload(req, res, (err) => {
    if (err) {
      console.log(err)
      res.render('index', {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        console.log(req.file.filename)
        res.render('index', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
}

function postStories(req, res) {

  //TODO UPDATE STORIE
  let upload = multer({
    storage: multer.diskStorage({
      destination: './users/' + req.user.username + '/private/',
      filename: function (req, file, cb) {
        while (!fs.existsSync(path.join(docfolder, file.originalname))) {
          file.originalname += "_new";
        }
        cb(null, file.originalname);
      }

    }),
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb, "stories");
    }
  }).single("my_" + "stories");

  upload(req, res, (err) => {
    if (err) {
      console.log(err)
      res.render('index', {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        console.log(req.file.filename)
        res.render('index', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
}

app.get('/images', (req, res) => {
  getMedia(req, res, 'images');
});
app.post('/images', (req, res) => {
  postMedia(req, res, 'images')
});

app.get('/audios', (req, res) => {
  getMedia(req, res, 'audios');
});
app.post('/audios', (req, res) => {
  postMedia(req, res, 'audios')
});

app.get('/widgets', (req, res) => {
  getMedia(req, res, 'widgets');
});
app.post('/widgets', (req, res) => {
  postMedia(req, res, 'widgets')
});

app.get('/stories', (req, res) => {
  postStories(req, res);
});
app.post('/stories', (req, res) => {
  postStories(req, res);
});

app.get('/stories/:user/:nomeStoria', (req, res) => {
  //TODO chiedere a micky come funziona l'accesso
  const directoryPath = path.join(__dirname + "/users/" + req.params.user, 'public');
  let data = fs.readFileSync(directoryPath + "/" + req.params.nomeStoria + '.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
  res.end();
});
app.get('/stories/private/:user/:nomeStoria', (req, res) => {
  //TODO chiedere a micky come funziona l'accesso
  //se non riusciamo a bloccare l'accesso alle directory, compilare ramo else
  let data;
  if (req.user.username && req.params.user == req.user.username) {
    const directoryPath = path.join(__dirname + "/users/" + req.params.user, 'private');
    data = fs.readFileSync(directoryPath + "/" + req.params.nomeStoria + '.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  }
  res.end();
});

app.get('/editorStoria/:visibility/:nomeStoria/', (req, res) => {
  res.render("index_Editor", {
    data: req.params.nomeStoria,
    visibility: req.params.visibility,
    user: req.user.username
  });
});


var numUsers = 0;
var evaluator = "valutatore";
var evalID = 0;

// TODO: fix this broken mess 
/*
app.get("/passwordevaluator", function(req, res){
  console.log("entrato nel controllo password");
  res.setHeader('Content-Type', 'application/json');
  res.end('admin');
});
*/
io.on("connection", (socket) => {
  var addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on("new user message", (data) => {
    // we tell the client to execute 'new message'
    socket.to(evalID).emit('new message', {
      username: socket.username,
      id: socket.id,
      message: data
    });
  });

  // when the client emits 'new message', this listens and executes
  socket.on("new eval message", (targetID, data) => {
    // we tell the client to execute 'new message'
    console.log(targetID);
    socket.to(targetID).emit('new message', {
      username: evaluator,
      message: data
    });
  });

  socket.on("add eval", () => {
    evalID = socket.id;
    socket.emit("login", {
      numUsers: numUsers
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on("add user", (username) => {
    if (addedUser) return;
    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit("login", {
      numUsers: numUsers,
    });
    // echo to the Evaluator that a person has connected
    socket.to(evalID).emit("user joined", {
      username: socket.username,
      id: socket.id,
      numUsers: numUsers,
    });

  });

  // when the client emits 'typing', we broadcast it to others
  socket.on("typing", () => {
    socket.to(evalID).emit("typing", {
      username: socket.username,
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", {
      username: socket.username,
    });
  });

  // when the user disconnects.. perform this
  socket.on("disconnect", () => {
    if (addedUser) {
      if (socket.username != evaluator) --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit("user left", {
        username: socket.username,
        numUsers: numUsers,
      });
    }
  });
});

app.use(express.static(resDir + "/"));
app.use(express.static(resDir + "public/Editor"));
app.use(express.static("public"));

server.listen(8000, () => {
  console.log('Listening on: https://localhost:8000/')
})