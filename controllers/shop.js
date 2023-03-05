const Product = require("../models/Product");


exports.getIndex = (req, res) => {
    Product.findAll(products => {
        res.render("shop/index", {
            products,
            pageTitle:"Home",
            path:"/"
        });
    });
};

exports.getProduct = (req, res) => {
    const slug = req.params.slug;
    Product.findBySlug(slug, product => {
        res.render("shop/product-detail", {
            pageTitle:product.title,
            path:"",
            product
        });
    })
};

exports.getProducts = (req, res) => {
    Product.findAll(products => {
        res.render("shop/product-list", {
            products,
            pageTitle:"Products",
            path:"/products"
        });
    });
};

exports.getCart = (req, res) => {
    res.render("shop/cart", {pageTitle:"Your Cart", path:"/cart"});
}

exports.getOrders = (req, res) => {
    res.render("shop/orders", {pageTitle:"Your Orders", path:"/orders"})
}

exports.getCheckout = (req, res) => {
    res.render("shop/checkout", {pageTitle: "Checkout", path:""});
}