const Product = require("../models/Product");


exports.getAddProduct = (req, res, next) => {
    // res.sendFile(path.join(rootDir,"views", "add-product.html"));
    res.render("admin/add-product",  {
        pageTitle:"Add Product",
        path:"/admin/add-product"
    })
}

exports.postAddProduct = (req, res) => {
    let { title } = req.body;
    let product = new Product(title);
    product.save();
    res.redirect("/");
}

exports.getProducts = (req, res) => {
    Product.findAll(products => {
        res.render("admin/products", {
            pageTitle:"Admin Products", 
            path:"/admin/products",
            products
        })
    })
}