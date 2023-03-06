const Product = require("../models/Product");


exports.getAddProduct = (req, res) => {
    // res.sendFile(path.join(rootDir,"views", "add-product.html"));
    res.render("admin/add-product",  {
        pageTitle:"Add Product",
        path:"/admin/add-product"
    })
}

exports.postAddProduct = (req, res) => {
    let { title, imageUrl, price, description } = req.body;
    let product = new Product(null, title, imageUrl, price, description);
    product.save();
    res.redirect("/");
}

exports.getEditProduct = (req, res) => {
    
    const productId = req.params.id;
    Product.findById(productId, product => {
        if(product.length == 0) return res.redirect("/admin/products")
        res.render("admin/edit-product",{
            pageTitle:"Edit Product",
            path:"/admin/products",
            product
        });
    });
}

exports.postEditProduct = (req, res) => {
    const {productId, updatedTitle, updatedImageUrl, updatedPrice, updatedDescription} = req.body;
    const product = new Product(productId, updatedTitle, updatedImageUrl, updatedPrice, updatedDescription);
    product.save();
    res.redirect("/admin/products");
};

exports.getProducts = (req, res) => {
    Product.findAll(products => {
        res.render("admin/products", {
            pageTitle:"Admin Products", 
            path:"/admin/products",
            products
        })
    })
}