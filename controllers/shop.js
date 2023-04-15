const fs = require("fs");
const path = require("path");

const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getIndex = (req, res, next) => {

    Product.find().then(products => {
        res.render("shop/index", {
            products,
            pageTitle:"Products",
            path:"/"            
        })
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
};

exports.getProduct = (req, res, next) => {
    const slug = req.params.slug;
    Product.findOne({slug}).then(product => {
        res.render("shop/product-detail", {
            pageTitle:product.title,
            path:"/products",
            product:product
        });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
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


exports.getCart = (req, res, next) => {
  
  req.user
  .populate("cart.items.productId", "title price")
  .then(user => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: user.cart.items
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
    req.user.addToCart(product);
    res.redirect('/cart');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.prodId;
  req.user.removeFromCart(prodId)
  .then(() => {
    res.redirect("/cart");
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}

exports.getOrders = (req, res, next) => {

  Order.find({
    'user.userId': req.user._id
  }).then(orders => {
    res.render("shop/orders", {
      pageTitle:"Your Orders",
      path:"/orders",
      orders
    })
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}

exports.postOrder = (req, res, next) => {
  req.user.populate("cart.items.productId")
    .then(user => {
      const products = user.cart.items.map(item => {
        return { quantity: item.quantity, product: {...item.productId._doc } }
      })
      const newOrder = new Order({
        user: {
          userId: req.user,
          name: req.user.name,
          email: req.user.email
        },
        products
      })
      req.user.clearCart();
      return newOrder.save()
    }).then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findOne({_id: orderId}).then(order => {
    if(!order)
      return next(new Error("No order found."));

    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error("Unauthorized"));
    }
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  const invoiceName = 'invoice-' + orderId + ".pdf";
  
  const invoicePath = path.join('data', 'invoices', invoiceName);
  const file = fs.createReadStream(invoicePath);
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    'inline; filename="' + invoiceName + '"'
    )
  file.pipe(res);
}