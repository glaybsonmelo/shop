const express = require('express');
const app = express();
const bodyParser = require("body-parser");

// const adminRoutes = require("./routes/admin");
// const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");
const { mongoConnect } = require('./util/database');

app.set("view engine", "ejs");

app.set("views", "views");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req, res, next) => {

});

// app.use("/admin", adminRoutes);
// app.use(shopRoutes);

// Middleware for 404
app.use(errorController.get404);

mongoConnect(() => {
    app.listen(3000);
  });

