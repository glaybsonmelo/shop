const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");
const { mongoConnect } = require('./util/database');
const User = require('./models/User');

app.set("view engine", "ejs");

app.set("views", "views");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  next()
});

app.use( async (req, res, next) => {
    User.findById('6414b50cac1d24be383a44e3')
      .then(user => {
        req.user = user;
        console.log(user)
        next();
    })
    .catch(err => console.log(err));

})
app.use("/admin", adminRoutes);
app.use(shopRoutes);


// Middleware for 404
app.use(errorController.get404);

mongoConnect( async () => {
  // if(req.user){

  // }else {
  //   const user = new User("admin", "admin@admin.com", "6170");
  //   user.save()
  //   .then(() => {app.listen(3000)})
  app.listen(3000)
  //   .catch(err => console.log(err));
  // }
  });

