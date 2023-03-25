const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const errorController = require("./controllers/error");
const User = require('./models/User');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

require('dotenv').config();

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
});

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(authRoutes);
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Middleware for 404
app.use(errorController.get404);

// Mongoose connection
mongoose
  .connect(
    process.env.MONGODB_URI
    )
  .then(async result => {
    User.findById('6419a1fdd207bec29d80866b').then(user => {
      if(!user){
        const user = new User({
          name: "Antonio Glaybson", 
          email:"email@test.com", 
          password: "123456",
          cart: {
            items: []
          }
        });
        return user.save()
      }
    }).then(() => {
      app.listen(3000, () => {
        console.log("Server on 🚀")
      });
    });
  })
  .catch(err => {
    console.log(err);
  });