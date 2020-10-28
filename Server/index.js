const express = require("express");

var path = require("path");
var find = require("find");
var fs = require("fs");

var passport = require("passport");
var Strategy = require("passport-local").Strategy;

var db = require("./db");
const { json } = require("body-parser");
var app = express();

var multer  = require('multer'); 
var uploader = multer({ dest: 'uploads/' });

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

//HOME
app.get("/", function (req, res) {
  res.render("home", { user: req.user });
});

//LOGIN
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
    var filelist = req.body.files;
    console.log(filelist);
    for(let i = 0; i<filelist.length; i++){
      let file = filelist[i];
      console.log(file);
      fs.renameSync(resDir + "/public/" + file, resDir + "/private/" + file);
    }
});

app.post("/makepublic", require('connect-ensure-login').ensureLoggedIn(), 
  function(req, res){
    var resDir = __dirname + "/users/" + req.user.username;
    var filelist = req.body.files;
    console.log(filelist);
    for(let i = 0; i<filelist.length; i++){
      let file = filelist[i];
      console.log(file);
      fs.renameSync(resDir + "/private/" + file, resDir + "/public/" + file);
    }
});


// Check File Type
function checkFileType(file, cb){ //la funzione per controllare se i file sono corretti ma mi sembra inutile. la tengo che non si sa mai 
  // Allowed ext
  let filetypes;
  switch(type){
    case "images": filetypes=/jpeg|jpg|png|gif/; break;
    case "audios": filetypes=/mp3|wav|ogg/; break;
    case "widgets": filetypes=/html/; break;
    case "stories":  filetypes=/mms/; break;
  }
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: '+type+' Only!');
  }
}



function getMedia(req, res, type){
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

function postMedia(req, res, type){
  let upload = multer({ 
    storage: multer.diskStorage({ 
      destination: './users/'+req.user.username+'/'+type+'/',
      filename: function(req, file, cb){
        while(!fs.existsSync(path.join(docfolder,file.originalname))) {
          file.originalname+="_new";
        }
        cb(null, file.originalname);
      }
      
    }),
    fileFilter: function(req, file, cb){
      checkFileType(file, cb, type);
    }
  }).single("my_"+type);

  upload(req, res, (err) => {
    if(err){
      console.log(err)
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
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

function postStories(req, res){

  //TODO UPDATE STORIE
  let upload = multer({ 
    storage: multer.diskStorage({ 
      destination: './users/'+req.user.username+'/private/',
      filename: function(req, file, cb){
        while(!fs.existsSync(path.join(docfolder,file.originalname))) {
          file.originalname+="_new";
        }
        cb(null, file.originalname);
      }
      
    }),
    fileFilter: function(req, file, cb){
      checkFileType(file, cb, "stories");
    }
  }).single("my_"+"stories");

  upload(req, res, (err) => {
    if(err){
      console.log(err)
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
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

app.get('/images', (req, res)=>{
  getMedia(req, res, 'images');
});
app.post('/images', (req, res) => {
  postMedia(req, res, 'images')
});

app.get('/audios', (req, res)=>{
  getMedia(req, res, 'audios');
});
app.post('/audios', (req, res) => {
  postMedia(req, res, 'audios')
});

app.get('/widgets', (req, res)=>{
  getMedia(req, res, 'widgets');
});
app.post('/widgets', (req, res) => {
  postMedia(req, res, 'widgets')
});

app.get('/stories', (req, res)=>{
  postStories(req, res);
});
app.post('/stories', (req, res) => {
  postStories(req, res);
});

app.get('/stories/:user/:nomeStoria', (req, res)=>{
  //TODO chiedere a micky come funziona l'accesso
  const directoryPath = path.join(__dirname + "/users/" + req.params.user, 'public');
  let data = fs.readFileSync(directoryPath+"/"+req.params.nomeStoria+'.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
  res.end();
});
app.get('/stories/private/:user/:nomeStoria', (req, res)=>{
  //TODO chiedere a micky come funziona l'accesso
  //se non riusciamo a bloccare l'accesso alle directory, compilare ramo else
  let data;
  if(req.user.username && req.params.user==req.user.username){
    const directoryPath = path.join(__dirname + "/users/" + req.params.user, 'private');
    data = fs.readFileSync(directoryPath+"/"+req.params.nomeStoria+'.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  }
  res.end();
});

app.get('/editor/:visibility/:nomeStoria', (req, res)=>{
  res.render("index_Editor", {data:req.params.nomeStoria, visibility:req.params.visibility, user:req.user.username});
});

app.use(express.static(resDir + "/"));
app.use(express.static(resDir + "public/Editor"));
app.use(express.static("public"));

app.listen(8000, () => {
  console.log(`Example app listening at http://localhost:8000`);
});
