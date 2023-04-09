const slugify = require("slugify");
const { validationResult } = require("express-validator");
const Product = require("../models/Product");

exports.getAddProduct = (req, res) => {
    res.render("admin/add-product",  {
        pageTitle:"Add Product",
        path:"/admin/add-product",
        validationErrors: [],
        errorMessage: null,
        oldInput: null
    })
}

exports.postAddProduct = (req, res) => {
    const errors = validationResult(req);
    const { title, imageUrl, price, description } = req.body;
    console.log(errors.array())
    if(!errors.isEmpty()){
        return res.status(422).render("admin/add-product",  {
            pageTitle:"Add Product",
            path:"/admin/add-product",
            oldInput: {
                title, imageUrl, price, description
            },
            validationErrors: errors.array(),
            errorMessage: errors.array()[0].msg
        })
    }
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
            errorMessage: null,
            validationErrors: []
        });
    }).catch(err => console.log(err));
}

exports.postEditProduct = (req, res, next) => {
    const {prodId, title, imageUrl, price, description} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.render("admin/edit-product",{
            pageTitle:"Edit Product",
            path:"/admin/products",
            // old input
            product: {_id: prodId, title, imageUrl, price, description},
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    Product.findOne({_id: prodId}).then(product => {

        if (product.userId.toString() !== req.user._id.toString()){
            return res.redirect("/");
        }
        product.title = title,
        product.slug = slugify(title, {lower: true}),
        product.price = price,
        product.description = description,
        product.imageUrl = imageUrl
        product.save().then(() => {
            res.redirect('/admin/products');
        });
    }).catch(err => console.log(err));

  };

exports.getProducts = (req, res) => {
    Product.find({userId: req.user._id})
    .select("title price imageUrl _id")
    .populate("userId", "name")
    .then(products => {
        res.render("admin/products", {
            pageTitle:"Admin Products", 
            path:"/admin/products",
            products
        })
    }).catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res) => {
    const productId = req.body.productId;
    Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(() => {
        res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
}