const express = require("express");

var path = require("path");
var find = require("find");
var fs = require("fs");

var passport = require("passport");
var Strategy = require("passport-local").Strategy;

var db = require("./db");
var app = express();

var multer  = require('multer'); //upload package 
var upload = multer({ dest: 'uploads/' }); // upload destination

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

// app.use(fileUpload({
//   createParentPath: true
// }));

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
    var files = res.json(req.body.filelist);
    for(let i = 0; i<files.length; i++){
      let file = files[i];
      fs.rename(resDir + "/public/" + file, resDir + "/private/" + file);
    }
});

// app.post('/upload-image', async (req, res) => {
//   try {
//       if(!req.files) {
//           res.send({
//               status: false,
//               message: 'No file uploaded'
//           });
//       } else {
//           //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
//           let avatar = req.files.avatar;
          
//           //Use the mv() method to place the file in upload directory (i.e. "uploads")
//           avatar.mv('./uploads/' + avatar.name);

//           //send response
//           res.send({
//               status: true,
//               message: 'File is uploaded',
//               data: {
//                   name: avatar.name,
//                   mimetype: avatar.mimetype,
//                   size: avatar.size
//               }
//           });
//       }
//   } catch (err) {
//       res.status(500).send(err);
//   }
// });



app.post('/upload', (req, res) => { // da adattare per le varie sezioni ed utenti
  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){ //non credo serva, può essere fatto localmente client-side
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        res.render('index', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});




const storage = multer.diskStorage({ //costante che dice dove caricare la roba e come. Io farei una variabile che perchè altrimenti non si puù cambiare per ogni utente
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({ //carica la roba, le varie righe sono abbastanza ovvie 
  storage: storage,
  limits:{fileSize: 1000000}, 
  fileFilter: function(req, file, cb){
    checkFileType(file, cb); // eviterei di averla: se carichi merda sei scemo tu
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){ //la funzione per controllare se i file sono corretti ma mi sembra inutile. la tengo che non si sa mai 
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

/*

la roba clientside per fare l'upload: nulla di speciale ma comunque meglio averla che no

<form action="/upload" method="POST" enctype="multipart/form-data">
      <div class="file-field input-field">
        <div class="btn grey">
          <span>File</span>
          <input name="myImage" type="file">
        </div>
        <div class="file-path-wrapper">
          <input class="file-path validate" type="text">
        </div>
      </div>
      <button type="submit" class="btn">Submit</button>
    </form>
*/


app.use(express.static(resDir + "/"));

app.listen(8000, () => {
  console.log(`Example app listening at http://localhost:8000`);
});
