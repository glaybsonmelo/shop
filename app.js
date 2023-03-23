const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const errorController = require("./controllers/error");
const User = require('./models/User');
const mongoose = require('mongoose');

require('dotenv').config();

app.set("view engine", "ejs");

app.set("views", "views");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  User.findById('6419a1fdd207bec29d80866b').then(user => { 
      req.user = user;
      next();
  }).catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


// Middleware for 404
app.use(errorController.get404);

// Mongoose connection
mongoose
  .connect(process.env.MONGODB_URL)
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