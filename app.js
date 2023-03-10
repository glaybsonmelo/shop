const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const Product = require("./models/Product");
const User = require("./models/User");
const Cart = require('./models/Cart');
const CartItem = require('./models/Cart-item');
const Order = require('./models/Order');
const OrderItem = require('./models/Order-items');


const errorController = require("./controllers/error");
const sequelize = require('./util/database');

app.set("view engine", "ejs");

app.set("views", "views");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


app.use((req, res, next) => {
    User.findByPk(1)
    .then(user => {
        if(user){
            req.user = user;
            next()
        }else{
            res.send("Não logado!");
        };
    })
    .catch(err => console.log(err));
})


app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Middleware for 404
app.use(errorController.get404);


//one-to-many
User.hasMany(Product);
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

// one-to-one
User.hasOne(Cart);
Cart.belongsTo(User);

// many-to-many
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem })

sequelize
    .sync()
// .sync({force:true})
    .then(result => {
        return User.findByPk(1);
    })
    .then(user => {
        if(!user){
            return User.create({name:"Antonio Glaybson", email:"gley@gmail.com", password:"123456"});
        }
        return user;
    })
    .then(user => {
        user.getCart().then(cart => {
            if(!cart){
                user.createCart();
            }
            return cart;
        })
    })
    .then(cart => {
        app.listen(3000)

    })
    .catch(err => console.log(err));

