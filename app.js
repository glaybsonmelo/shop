const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const csrf = require("csurf");
const session = require('express-session');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression")
// const morgan = require("morgan");
// const fs = require("fs");
// const path = require("path");
// const https = require("https");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const errorController = require("./controllers/error");
const User = require('./models/User');
const isAuth = require('./middlewares/is-auth');

require('dotenv').config();

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname)
  }
})

const fileFilterr = (req, file, cb) => {
  if(file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === 'image/jpg')
    cb(null, true);
  else
    cb(null, false);
}

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));
app.use("/images", express.static("images"));

// const acessLogStream = fs.createWriteStream(path.join(__dirname, 'acess.log'), { flags: 'a' });

app.use(helmet());
app.use(compression());
// app.use(morgan('combined', { stream: acessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({dest: 'images', storage: fileStorage, fileFilter: fileFilterr}).single('image'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(csrfProtection);
app.use(flash());

// isso serve para não repetir em todas as rotas
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn,
    res.locals.csrfToken = req.csrfToken();
  next();
})

app.use((req, res, next) => {

  if (!req.session.user) {
    return next();
  }
  // req.user.session não pega os metodos, por isso esse codigo
  User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next();
      }
      req.user = user;
      next();
    }).catch(err => {
      next(new Error(err));
    })
})

app.use(authRoutes);
app.use("/admin", isAuth, adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
app.use(errorController.get500);
console.log(process.env.PORT)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(result => {
    // https.createServer({ key: privateKey, cert: certificate }, app).listen(3000);
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });