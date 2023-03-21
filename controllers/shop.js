const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");

exports.getIndex = (req, res) => {
    Product.find().then(products => {
        res.render("shop/index", {
            products,
            pageTitle:"Products",
            path:"/"
        })
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    });;
};

exports.getProduct = (req, res) => {
    const slug = req.params.slug;
    Product.findOne({slug}).then(product => {
        res.render("shop/product-detail", {
            pageTitle:product.title,
            path:"/products",
            product:product
        });
    }).catch(err => console.log(err));
};

exports.getProducts = (req, res) => {
    Product.find().then(products => {
      res.render("shop/product-list", {

        products,
        pageTitle:"Products",
        path:"/products"
      });
    })
};

// exports.getOrders = (req, res) => {
//   req.user.getOrders().then(orders => {
//     console.log(orders)
//     res.render("shop/orders", {pageTitle:"Your Orders", path:"/orders", orders})
//   }).catch(err => console.log(err));
// }

// // exports.getCheckout = (req, res) => {
// //     res.render("shop/checkout", {pageTitle: "Checkout", path:""});
// // }

exports.getCart = (req, res, next) => {

    req.user
       .populate("cart.items.productId", "title price")
          .then(user => {
            // console.log(user.cart.items[0].productId.title)
            res.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: user.cart.items
            });
          })
          .catch(err => console.log(err));
}

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res) => {
    const prodId = req.body.prodId;
    req.user.removeFromCart(prodId)
    .then(() => {
        res.redirect("/cart");
    })
    .catch(err => console.log(err));
}

// exports.postOrder = (req, res) => {
//   req.user.addOrder().then(() => {
//     res.redirect("/orders");
//   })
//   .catch(err => console.log(err));
// }