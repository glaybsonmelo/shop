const slugify = require("slugify");
const Product = require("../models/Product");
const { getDb } = require("../util/database");
const mongodb = require("mongodb");

exports.getAddProduct = (req, res) => {
    res.render("admin/add-product",  {
        pageTitle:"Add Product",
        path:"/admin/add-product"
    })
}

exports.postAddProduct = (req, res) => {
    const { title, imageUrl, price, description } = req.body;
    const product = new Product(title, price, description, imageUrl);
    product.save()
        .then(() => {
            res.redirect('/');
        })
        .catch(err => console.log(err));
}

exports.getEditProduct = (req, res) => {
    
    const productId = req.params.id;
    Product.fetchById(productId).then(product => {
        if(!product) {
            res.redirect("/");
        }
        res.render("admin/edit-product",{
            pageTitle:"Edit Product",
            path:"/admin/products",
            product
        });
    }).catch(err => console.log(err));
}

// exports.postEditProduct = (req, res) => {
//     const {prodId, title, imageUrl, price, description} = req.body;
//     // console.log(prodId);
//     const product = new Product(new mongodb.ObjectId(prodId), title, slugify(title, {lower:true}, price, description, imageUrl));
//     product.save().then(() => {
//         res.redirect("/admin/products");
//     })
//     .catch(err => console.log(err));
   
// };

exports.postEditProduct = (req, res, next) => {
    const {prodId, title, imageUrl, price, description} = req.body;
  
    const product = new Product(
        new mongodb.ObjectId(prodId),
        title,
        price, 
        description, 
        imageUrl
        );
    product
      .save()
      .then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      })
      .catch(err => console.log(err));
  };


exports.getProducts = (req, res) => {
    Product.fetchAll().then(products => {
        res.render("admin/products", {
            pageTitle:"Admin Products", 
            path:"/admin/products",
            products
        })
    }).catch(err => console.log(err));
}

// exports.postDeleteProduct = (req, res) => {
//     const productId = req.body.productId;
//     Product.findByPk(productId).then(product => {
//         return product.destroy();
//     })
//     .then(result => {
//         res.redirect("/admin/products");
//     })
//     .catch(err => console.log(err));
// }