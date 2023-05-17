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
const crypto = require("crypto");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");
const s3Proxy = require("s3-proxy");
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

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "us-east-2"
});

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));
app.use("/images", express.static("images"));

// const acessLogStream = fs.createWriteStream(path.join(__dirname, 'acess.log'), { flags: 'a' });
app.use(
  helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", 'js.stripe.com'],
          'style-src': ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          'frame-src': ["'self'", 'js.stripe.com'],
          'font-src': ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
        },
        nonce: crypto.randomBytes(16).toString('base64'),
  })
)
app.use(compression());
// app.use(morgan('combined', { stream: acessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(flash());
// app.use(csrfProtection);

// isso serve para não repetir em todas as rotas
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn,
    res.locals.csrfToken = ""//req.csrfToken();
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

app.get('/images/*', s3Proxy({
  bucket: 'shop-node',
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'us-east-2',
}));

app.use(authRoutes);
app.use("/admin", isAuth, adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
app.use(errorController.get500);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(result => {
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });

// module.exports = {
//     upload: upload
// };