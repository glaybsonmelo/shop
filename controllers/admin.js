const slugify = require("slugify");
const { validationResult } = require("express-validator");
const fileHelper = require("../utils/file");

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

exports.postAddProduct = (req, res, next) => {

    const errors = validationResult(req);
    const { title, price, description } = req.body;
    const image = req.file;
    if(!image){
        return res.status(422).render("admin/add-product",  {
            pageTitle:"Add Product",
            path:"/admin/add-product",
            oldInput: {
                title, price, description
            },
            validationErrors: [],
            errorMessage: 'Attached file is not an image.'
        })       
    }
    if(!errors.isEmpty()){
        return res.status(422).render("admin/add-product",  {
            pageTitle:"Add Product",
            path:"/admin/add-product",
            oldInput: {
                title, price, description
            },
            validationErrors: errors.array(),
            errorMessage: errors.array()[0].msg
        })
    }
    const imageUrl = image.path;
    const product = new Product({title, slug:slugify(
        title, {lower:true}), price, description, imageUrl, userId: req.user
    });
    product.save()
        .then(() => {
            res.redirect('/');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getEditProduct = (req, res, next) => {
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
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postEditProduct = (req, res, next) => {
    const { prodId, title, price, description } = req.body;
    const image = req.file;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.render("admin/edit-product",{
            pageTitle:"Edit Product",
            path:"/admin/products",
            // old input
            product: {_id: prodId, title, price, description},
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
        product.description = description
        if(image){
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        product.save().then(() => {
            res.redirect('/admin/products');
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

  };

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    .select("title price imageUrl _id")
    .populate("userId", "name")
    .then(products => {
        res.render("admin/products", {
            pageTitle:"Admin Products", 
            path:"/admin/products",
            products
        })
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId).then(product => {
        if(!product) {
            return next(new Error("Product not found."))
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({ _id: productId, userId: req.user._id })
    }).then(() => {
        res.redirect("/admin/products");
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
}