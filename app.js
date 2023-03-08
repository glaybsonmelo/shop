const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const Product = require("./models/Product");


const errorController = require("./controllers/error");

app.set("view engine", "ejs");

app.set("views", "views");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Middleware for 404
app.use(errorController.get404);

Product.sync()
    .then(result => {
        console.log(result)
        app.listen(3000, () => {console.log("Server on")});
    })
    .catch(err => console.log(err));

