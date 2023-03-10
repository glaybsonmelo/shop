const Product = require("../models/Product");
const Cart = require("../models/Cart");

exports.getIndex = (req, res) => {
    Product.findAll().then(products => {
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
    Product.findOne({
        where:{slug}
    }).then(product => {
        res.render("shop/product-detail", {
            pageTitle:product.title,
            path:"/products",
            product:product
        });
    }).catch(err => console.log(err));
};

exports.getProducts = (req, res) => {
    Product.findAll().then(products => {
        res.render("shop/product-list", {
            products,
            pageTitle:"Products",
            path:"/products"
        })
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    });;
};

exports.getCart = (req, res, next) => {
    req.user
      .getCart()
      .then(cart => {
        return cart
          .getProducts()
          .then(products => {
        // console.log(products)

            res.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: products
            });
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  };

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
      .then(cart => {
        fetchedCart = cart;
        return cart.getProducts({ where: { id: prodId } });
      })
      .then(products => {
        let product;
        if (products.length > 0) {
          product = products[0];
        }
  
        if (product) {
          const oldQuantity = product.cartItems.quantity;
          newQuantity = oldQuantity + 1;
          return product;
        }
        return Product.findByPk(prodId);
      })
      .then(product => {
        return fetchedCart.addProduct(product, {
          through: { quantity: newQuantity }
        });
      })
      .then(() => {
        res.redirect('/cart');
      })
      .catch(err => console.log(err));
  };

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.prodId;
  req.user.getCart().then(cart => {
    return cart.getProducts({where:{id:prodId}});
  })
  .then((products) => {
    const product = products[0];
    return product.cartItems.destroy();
  })
  .then(() => {

    res.redirect("/cart");
  })
  .catch(err => console.log(err));
}

exports.postOrder = (req, res) => {
  let fetchedCart;
  req.user.getCart().then(cart => {
    fetchedCart = cart;
    return cart.getProducts();
  }).then(products => {
    return req.user
    .createOrder()
    .then(order => {
        return order.addProducts(products.map(product => {
          product.orderItems = { quantity: product.cartItems.quantity }
          return product;
        }))
    })
      .catch(err => console.log(err));
  }).then(result => {
    return fetchedCart.setProducts(null);
  }).then(() => {
    res.redirect("/orders");
  })
  .catch(err => console.log(err));
}

exports.getOrders = (req, res) => {
  req.user.getOrders({include:['products']}).then(orders => {
    res.render("shop/orders", {pageTitle:"Your Orders", path:"/orders", orders})
  }).catch(err => console.log(err));
}

exports.getCheckout = (req, res) => {
    res.render("shop/checkout", {pageTitle: "Checkout", path:""});
}
