const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");

exports.getIndex = (req, res) => {
    Product.fetchAll().then(products => {
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
    Product.fetchBySlug(slug).then(product => {
        res.render("shop/product-detail", {
            pageTitle:product.title,
            path:"/products",
            product:product
        });
    }).catch(err => console.log(err));
};

exports.getProducts = (req, res) => {
    Product.fetchAll().then(products => {
      res.render("shop/product-list", {

        products,
        pageTitle:"Products",
        path:"/products"
      });
    })
};

exports.getOrders = (req, res) => {
  req.user.getOrders().then(orders => {
    console.log(orders)
    res.render("shop/orders", {pageTitle:"Your Orders", path:"/orders", orders})
  }).catch(err => console.log(err));
}

// exports.getCheckout = (req, res) => {
//     res.render("shop/checkout", {pageTitle: "Checkout", path:""});
// }
exports.getCart = (req, res, next) => {
    req.user
       .getCart()
          .then(products => {
            res.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: products
            });
          })
          .catch(err => console.log(err));
}
   


exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    Product.fetchById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    });

    // let fetchedCart;
    // let newQuantity = 1;
    // req.user.getCart()
    //   .then(cart => {
    //     fetchedCart = cart;
    //     return cart.getProducts({ where: { id: prodId } });
    //   })
    //   .then(products => {
    //     let product;
    //     if (products.length > 0) {
    //       product = products[0];
    //     }
  
    //     if (product) {
    //       const oldQuantity = product.cartItems.quantity;
    //       newQuantity = oldQuantity + 1;
    //       return product;
    //     }
    //     return Product.findByPk(prodId);
    //   })
    //   .then(product => {
    //     return fetchedCart.addProduct(product, {
    //       through: { quantity: newQuantity }
    //     });
    //   })
    //   .then(() => {
    //     res.redirect('/cart');
    //   })
    //   .catch(err => console.log(err));
};
exports.postCartDeleteProduct = (req, res) => {
    const prodId = req.body.prodId;

    req.user.deleteItemFromCart(prodId)
    .then(() => {
        res.redirect("/cart");
    })
    .catch(err => console.log(err));
}

exports.postOrder = (req, res) => {
  req.user.addOrder().then(() => {
    res.redirect("/orders");
  })
  .catch(err => console.log(err));
}