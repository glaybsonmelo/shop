const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");
// const { mongoConnect } = require('./util/database');
const User = require('./models/User');
const mongoose = require('mongoose');

app.set("view engine", "ejs");

app.set("views", "views");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  next()
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);


// Middleware for 404
app.use(errorController.get404);

// Mongoose connection
mongoose
  .connect("mongodb+srv://gleybsonmelo998:379KUThMsmgcBnnj@cluster0.hu8nwbh.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then(result => {
    app.listen(3000, () => {
      console.log("Server on 🚀")
    });
  })
  .catch(err => {
    console.log(err);
  });