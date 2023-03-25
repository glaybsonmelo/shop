const { ObjectId } = require("mongodb");
const Order = require("../models/Order");
const Product = require("../models/Product");


exports.getIndex = (req, res) => {

    Product.find().then(products => {
        res.render("shop/index", {
            products,
            pageTitle:"Products",
            path:"/",
            isAuthenticated: req.session.isLoggedIn
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
            product:product,
            isAuthenticated: req.session.isLoggedIn
        });
    }).catch(err => console.log(err));
};

exports.getProducts = (req, res) => {
    Product.find().then(products => {
      res.render("shop/product-list", {

        products,
        pageTitle:"Products",
        path:"/products",
        isAuthenticated: req.session.isLoggedIn
      });
    })
};


exports.getCart = (req, res, next) => {
  
  req.session.user
  .populate("cart.items.productId", "title price")
  .then(user => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: user.cart.items,
      isAuthenticated: req.session.isLoggedIn
    });
  })
  .catch(err => console.log(err));
}

exports.postCart = (req, res) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
    return req.session.user.addToCart(product);
  })
  .then(result => {
    res.redirect('/cart');
  });
};

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.prodId;
  req.session.user.removeFromCart(prodId)
  .then(() => {
    res.redirect("/cart");
  })
  .catch(err => console.log(err));
}

exports.getOrders = (req, res) => {

  // if (!req.session.user){
  //   res.render("shop/orders", {
  //     pageTitle:"Your Orders",
  //     path:"/orders",
  //     orders:[],
  //     isAuthenticated: req.session.isLoggedIn
  //   })
  // }
  Order.find({
    'user.userId': req.session.order._id
  }).then(orders => {
    res.render("shop/orders", {
      pageTitle:"Your Orders",
      path:"/orders",
      orders,
      isAuthenticated: req.session.isLoggedIn
    })
  }).catch(err => console.log(err));
}

exports.postOrder = (req, res) => {
  req.session.user.populate("cart.items.productId")
    .then(user => {
      const products = user.cart.items.map(item => {
        return { quantity: item.quantity, product: {...item.productId._doc } }
      })
      const newOrder = new Order({
        user: {
          userId: req.session.user,
          name: req.session.user.name
        },
        products
      })
      req.session.user.clearCart();
      return newOrder.save()
    }).then(() => {
      res.redirect("/orders");
    })
    .catch(err => console.log(err));
}