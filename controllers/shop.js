const fs = require("fs");
const path = require("path");
require('dotenv').config();
const PDFDocument = require("pdfkit");
const stripe = require("stripe")(process.env.STRIPE_PAYMENT_API_KEY);

const Order = require("../models/Order");
const Product = require("../models/Product");

const ITEMS_PER_PAGE = 5;

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems = 0;
  Product.countDocuments({})
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
    })
  .then(products => {
      res.render("shop/product-list", {
          products,
          pageTitle:"Products",
          path:"/",
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviusPage: page > 1,
          nextPage: page + 1,
          previusPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      })
  }).catch(err => {
    const error = new Error(err);
    console.log(err);

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
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
};

exports.getProducts = (req, res) => {

    const page = +req.query.page || 1;
    let totalItems = 0;
    Product.countDocuments({})
      .then(numProducts => {
        totalItems = numProducts;
        return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
      })
    .then(products => {
        res.render("shop/product-list", {
            products,
            pageTitle:"Products",
            path:"/products",
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviusPage: page > 1,
            nextPage: page + 1,
            previusPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        })
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
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
    console.log(err);
  
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
    console.log(err);

    error.httpStatusCode = 500;
    return next(error);
});
}

exports.getCheckout = (req, res, next) => {

  let products;
  let totalPrice = 0;
  req.user
  .populate("cart.items.productId", "title price")
  .then(user => {
    products = user.cart.items;

    products.forEach(p => {
      totalPrice += p.quantity * p.productId.price;
    });

    return stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: products.map(p => {
        return {
          price_data: {
            currency: 'usd',
            unit_amount: p.productId.price * 100,
            product_data: {
              name: p.productId.title,
              description: p.productId.description,
            },
          },
          quantity: p.quantity
        }
      }),
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
    });
  }).then(session => {
    res.render('shop/checkout', {
      path: '/checkout',
      pageTitle: 'Checkout',
      products,
      totalPrice,
      sessionId: session.id
    });
  })
  .catch(err => {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCheckoutSucess = (req, res, next) => {
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
      console.log(err);

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

    const invoiceName = 'invoice-' + orderId + ".pdf";
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();
    const writeStream = fs.createWriteStream(invoicePath);
    pdfDoc.pipe(writeStream);
    pdfDoc.fontSize(26).text("Invoice", {
      underline: true
    });
    pdfDoc.text("-------------------------");
    let totalPrice = 0;
    order.products.forEach(prod => {
      pdfDoc.fontSize(14).text(`${prod.product.title} - ${prod.quantity}x $${prod.product.price}`);
      totalPrice += prod.product.price * prod.quantity;
    });
    pdfDoc.text("-------------------------");
    pdfDoc.fontSize(20).text(`Total: $${totalPrice}`);
    pdfDoc.end();

    writeStream.on('finish', () => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      const readStream = fs.createReadStream(invoicePath);
      readStream.pipe(res);
    });

  }).catch(err => {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};
