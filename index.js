var express = require('express');
var app = express();

var fs = require('fs');
var chmodr = require('chmodr');
var http = require('http');

var path = require('path');


const fileUpload = require('express-fileupload');

var passport = require("passport");
var Strategy = require("passport-local").Strategy;

var db = require("./db");
const {
  json
} = require("body-parser");

app.use(fileUpload());

var bodyParser = require('body-parser');
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 1000000
}));

var server = http.createServer(app);
var io = require('socket.io')(server);

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

var resDir = __dirname + "/";

app.use(express.static(__dirname));
app.use(express.static(resDir + "/"));
app.use(express.static(resDir + "public"));
app.use(express.static(resDir + "users"));
app.use(express.static(resDir + "db"));

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
  if (req.user) {
    res.render("index", {
      user: req.user.username
    });
  } else {
    res.redirect("avventure")
  }
});

//QR
app.get("/avventure", function (req, res) {
  fs.readFile(__dirname + '/db/UsersData.json', function (err, data) {
    let json = JSON.parse(data);
    if (err)
      throw err;
    res.render("qr", {
      data: json
    });
  });
});

//LOGIN
app.get("/login", function (req, res) {
  res.render("login", {
    user: "none"
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login"
  }),
  function (req, res) {
    res.redirect("/index");
  }
);

app.post("/newUser", function (req, res) {
  fs.readFile(__dirname + '/db/UsersData.json', function (err, data) {
    let json = JSON.parse(data)
    console.log(req.body.newusername, " ", req.body.newpassword);
    json.push({
      "id": json.length + 1,
      "username": req.body.newusername,
      "password": req.body.newpassword,
      "displayName": req.body.newusername
    })
    fs.writeFile(__dirname + '/db/UsersData.json', JSON.stringify(json), function (err) {
      if (err) {
        res.render("login", {
          user: "errore"
        });
        throw err;
      };
      console.log('Saved!');
      let dir = resDir + 'users/' + req.body.newusername;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        fs.mkdirSync(dir + "/audios");
        fs.mkdirSync(dir + "/images");
        fs.mkdirSync(dir + "/css");
        fs.mkdirSync(dir + "/private");
        fs.mkdirSync(dir + "/public");
        fs.mkdirSync(dir + "/widgets");
        fs.copyFileSync(resDir + 'users/Widget/canvas.html', dir + '/widgets/canvas.html');
        fs.copyFileSync(resDir + 'users/Widget/combinazione.html', dir + '/widgets/combinazione.html');
        fs.copyFileSync(resDir + 'users/Widget/image.html', dir + '/widgets/image.html');
        fs.copyFileSync(resDir + 'users/Widget/text.html', dir + '/widgets/text.html');
        fs.copyFileSync(resDir + 'users/Widget/lever.html', dir + '/widgets/lever.html');
        fs.copyFileSync(resDir + 'users/Widget/number.html', dir + '/widgets/number.html');
        fs.copyFileSync(resDir + 'users/Widget/sendImage.html', dir + '/widgets/sendImage.html');
        fs.copyFileSync(resDir + 'users/Widget/templateWidget.html', dir + '/widgets/templateWidget.html');
        fs.copyFileSync(resDir + 'users/Widget/csstemplate.css', dir + '/css/csstemplate.css');
      }
      chmodr(dir, 0o775, (err) => {
        if (err) {
          console.log('Failed to execute chmod', err);
        } else {
          console.log('Success');
        }
      });
      res.render("login", {
        user: req.body.newusername
      });
    })
  })

});

//LOGOUT
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});


//INDEX
app.get("/index", require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    res.render("index", {
      user: req.user.username
    });
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

app.post("/makeprivate", require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var resDir = __dirname + "/users/" + req.user.username;
    var file = req.body.name;
    fs.renameSync(resDir + "/public/" + file, resDir + "/private/" + file);
    res.sendStatus(200);
  });

app.post("/rename", require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var resDir = __dirname + "/users/" + req.user.username;
    fs.renameSync(resDir + "/" + req.body.visibility + "/" + req.body.name, resDir + "/" + req.body.visibility + "/" + req.body.newName);
    res.sendStatus(200);
  });

app.post("/makepublic", require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var resDir = __dirname + "/users/" + req.user.username;
    var file = req.body.name;
    fs.renameSync(resDir + "/private/" + file, resDir + "/public/" + file);
    res.sendStatus(200);
  }
);

app.post("/delete", require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var resDir = __dirname + "/users/" + req.user.username;
    var file = req.body.name;
    fs.unlinkSync(resDir + "/" + req.body.visibility + "/" + file);
    res.sendStatus(200);
  }
);



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
    case "css":
      filetypes = /css/;
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
      filelist.push(file);
    });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(filelist));
    res.end();
  });
}

app.get('/allStories', (req, res) => {
  let filelist = [];
  let directoryPath = path.join(__dirname + "/users/" + req.user.username, "private");
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      filelist.push({
        name: file,
        visibility: 'private'
      });
    });

    directoryPath = path.join(__dirname + "/users/" + req.user.username, "public");
    fs.readdir(directoryPath, function (err, files) {
      //handling error
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      //listing all files using forEach
      files.forEach(function (file) {
        // Do whatever you want to do with the file
        filelist.push({
          name: file,
          visibility: 'public'
        });
      });

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(filelist));
      res.end();
    });
  });
});

app.get('/media/:type', (req, res) => {
  let type = req.params.type;
  if (type == "widgets" || type == "images" || type == "audios" || type == "css")
    getMedia(req, res, type);
});


app.post('/media/:type', (req, res) => {
  const type = req.params.type;
  if (type == "widgets" || type == "images" || type == "audios" || type == "css") {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field
    let file = req.files.file;

    // Use the mv() method to place the file somewhere on your server
    const directoryPath = path.join(__dirname + "/users/" + req.user.username, type);
    file.mv(directoryPath + "/" + file.name, function (err) {
      if (err)
        return res.status(500).send(err);

      res.send(file.name);
    });
  }
});


app.post("/media/rename/:type", require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var resDir = __dirname + "/users/" + req.user.username;
    fs.renameSync(resDir + "/" + req.params.type + "/" + req.body.name, resDir + "/" + req.params.type + "/" + req.body.newName);
    res.sendStatus(200);
    res.end();
  }
);

app.post("/media/delete/:type", require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var resDir = __dirname + "/users/" + req.user.username;
    var file = req.body.name;
    fs.unlinkSync(resDir + "/" + req.params.type + "/" + file);
    res.sendStatus(200);
  });

//usare questo per richiedere un file della storia
app.get('/media/:user/:type/:name', (req, res) => {
  let type = req.params.type;
  if (type == "widgets" || type == "images" || type == "audios" || type == "css") {
    const file = path.join(__dirname + "/users/" + req.params.user + "/" + req.params.type, req.params.name)
    res.sendFile(file);
  }
});

app.post('/import', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  const directoryPath = path.join(__dirname + "/users/" + req.user.username, "private");
  console.log(req.body.name);
  fs.writeFileSync(directoryPath + "/" + req.body.name, JSON.stringify(req.body.data));
  res.sendStatus(200);
  res.end();
});

app.get('/:user/stories', (req, res) => {
  directoryPath = path.join(__dirname + "/users/" + req.params.user, "public");
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(files));
    res.end();
  });
});

app.post('/stories', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  const directoryPath = path.join(__dirname + "/users/" + req.user.username, "private");
  let name = req.body.name;
  while (fs.existsSync(path.join(directoryPath, name + ".json"))) {
    name += "_new";
  }
  data = fs.writeFileSync(directoryPath + "/" + name + '.json', JSON.stringify({
    nome: "Nuova Storia",
    categoria: "Singolo",
    accessibile: false,
    target: "7-10",
    ngruppi: 1,
    background: "",
    css: "",
    autore: req.user.username,
    creatore: req.user.username,
    scene: [{
        nome: "Inizio",
        "x": 15,
        "y": 15,
        "risposte": [{
          "to": [-1]
        }]
      },
      {
        nome: "Fine",
        x: 150,
        y: 100
      }
    ]
  }));
  res.send(name);
  res.end();
});

app.get('/stories/:user/:visibility/:nomeStoria', (req, res) => {
  let data;
  if (req.params.visibility == "public" || (req.params.visibility == "private" && (req.user.username && req.params.user == req.user.username))) {
    const directoryPath = path.join(__dirname + "/users/" + req.params.user, req.params.visibility);
    data = fs.readFileSync(directoryPath + "/" + req.params.nomeStoria + '.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  }
  res.end();
});

app.post('/stories/:user/:visibility/:nomeStoria', (req, res) => {
  if (req.user.username && req.params.user == req.user.username) {
    const directoryPath = path.join(__dirname + "/users/" + req.params.user, req.params.visibility);
    data = fs.writeFileSync(directoryPath + "/" + req.params.nomeStoria + '.json', JSON.stringify(req.body.data));
    res.sendStatus(200);
  }
  res.end();
});

app.get('/editorStoria/:visibility/:nomeStoria/', require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
  res.render("index_Editor", {
    data: req.params.nomeStoria,
    visibility: req.params.visibility,
    user: req.user.username
  });
});

//ROUTE TO STORIES
app.get('/avventura/:user/:name', (req, res) => {
  url = '/users/' + req.params.user + '/public/' + req.params.name + '.json';
  res.render("giocatore", {
    urlStoria: url
  });
});
  
app.get('/avventura/:user/:name/Valutatore', (req, res) => {
  url = '/users/' + req.params.user + '/public/' + req.params.name + '.json';
  res.render("valutatore", {
    urlStoria: url
  });
});

var evaluator = "valutatore";
//Dizionario Storia = ID del valutatore su quella storia
var evaluators = {};

io.on("connection", (socket) => {
  var addedUser = false;

  socket.on("scene", (username, storia, num) => {
    try {
      socket.to(evaluators[storia]).emit('scene', {
        username: username,
        room: num,
      });
    } catch (error) {}
  });

  socket.on('score', (username, storia, data) => {
    try {
      socket.to(evaluators[storia]).emit('score', {
        username: username,
        score: data,
      });
    } catch (error) {}
  });

  socket.on('answerToEvaluator', (username, storia, data) => {
    try {
      socket.to(evaluators[storia]).emit('answerToEvaluator', {
        username: username,
        message: data,
      });
    } catch (error) {

    }
  });

  socket.on('answerFromEvaluator', (id, data) => {
    socket.to(id).emit('answerFromEvaluator', {
      message: data,
    });
  });

  socket.on('help', (storia, data) => {
    socket.to(evaluators[storia]).emit('help', {
      username: socket.username,
      message: data
    });
  });

  socket.on('helpIncoming', (targetId, data) => {
    socket.to(targetId).emit('helpIncoming', {
      username: evaluator,
      message: data
    });
  });

  // when the client emits 'new message', this listens and executes
  socket.on("new user message", (storia, data) => {
    // we tell the client to execute 'new message'
    socket.to(evaluators[storia]).emit('new message', {
      username: socket.username,
      id: socket.id,
      message: data
    });
  });

  // when the evaluator emits 'new message', this listens and executes
  socket.on("new eval message", (targetID, data) => {
    // we tell the client to execute 'new message'
    socket.to(targetID).emit('new message', {
      username: evaluator,
      message: data
    });
  });

  socket.on("add eval", (storia) => {
    evaluators[storia] = socket.id;
    socket.emit("login");
  });

  // when the client emits 'add user', this listens and executes
  socket.on("add user", (username, storia) => {
    if (addedUser) return;
    // we store the username in the socket session for this client
    socket.username = username;
    addedUser = true;
    socket.emit("login");
    try {
      socket.to(evaluators[storia]).emit("user joined", {
        username: username,
        id: socket.id,
      });
    } catch (error) {

    }
    // echo to the Evaluator that a person has connected

  });

  socket.on('assignGroup', (data) => {
    socket.to(data.id).emit("assignGroup", {
      groupN: data.groupN,
    });
  });


  // when the client emits 'typing', we broadcast it to others
  socket.on("typing", (storia) => {
    socket.to(evaluators[storia]).emit("typing", {
      username: socket.username,
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on("stop typing", (storia) => {
    socket.to(evaluators[storia]).emit("stop typing", {
      username: socket.username,
    });
  });

  // when the user disconnects.. perform this
  socket.on("disconnect", () => {
    if (addedUser) {

      // echo globally that this client has left
      socket.broadcast.emit("user left", {
        username: socket.username,
      });
    }
  });
});

server.listen(8000, () => {
  console.log('Listening on: https://site181993.tw.cs.unibo.it')
});