const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const csrf = require("csurf");
const session = require('express-session');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require("connect-flash");

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

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.use(errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle:"Internal server error",
    path:"/500",
    isAuthenticated: req.isLoggedIn
});
});
// Mongoose connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async result => {
    app.listen(3000, () => {
      console.log("Server on 🚀")
    });
  })
  .catch(err => {
    console.log(err);
  });