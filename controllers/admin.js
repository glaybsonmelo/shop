const slugify = require("slugify");
const Product = require("../models/Product");


exports.getAddProduct = (req, res) => {
    res.render("admin/add-product",  {
        pageTitle:"Add Product",
        path:"/admin/add-product",
        isAuthenticated: req.isLoggedIn
    })
}

exports.postAddProduct = (req, res) => {
    const { title, imageUrl, price, description } = req.body;
    const product = new Product({title, slug:slugify(
        title, {lower:true}), price, description, imageUrl, userId: req.user
    });
    product.save()
        .then(() => {
            res.redirect('/');
        })
        .catch(err => console.log(err));
}

exports.getEditProduct = (req, res) => {
    const productId = req.params.id;
    Product.findById(productId).then(product => {
        if(!product) {
            res.redirect("/");
        }
        res.render("admin/edit-product",{
            pageTitle:"Edit Product",
            path:"/admin/products",
            product,
            isAuthenticated: req.isLoggedIn
        });
    }).catch(err => console.log(err));
}

exports.postEditProduct = (req, res, next) => {
    const {prodId, title, imageUrl, price, description} = req.body;
    
    Product.findByIdAndUpdate({_id: prodId}, {
        title,
        slug:slugify(title, {lower: true}),
        price,
        description,
        imageUrl,
        isAuthenticated: req.isLoggedIn
    }).then(product => {  
        res.redirect('/admin/products');
    }).catch(err => console.log(err));

  };

exports.getProducts = (req, res) => {
    Product.find()
    .select("title price imageUrl _id")
    .populate("userId", "name")
    .then(products => {
        res.render("admin/products", {
            pageTitle:"Admin Products", 
            path:"/admin/products",
            products,
            isAuthenticated: req.isLoggedIn
        })
    }).catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res) => {
    const productId = req.body.productId;
    Product.findByIdAndDelete(productId)
    .then(() => {
        res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
}