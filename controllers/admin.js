const slugify = require("slugify");
const Product = require("../models/Product");


exports.getAddProduct = (req, res) => {
    // res.sendFile(path.join(rootDir,"views", "add-product.html"));
    res.render("admin/add-product",  {
        pageTitle:"Add Product",
        path:"/admin/add-product"
    })
}

exports.postAddProduct = (req, res) => {
    const { title, imageUrl, price, description } = req.body;

    req.user.createProduct({
        title, slug:slugify(title, {lower:true}), price, description, imageUrl
    }).then(() => {
        res.redirect("/admin/products");
    }).catch(err => {
        res.redirect('/admin/add-product');
    });
}

exports.getEditProduct = (req, res) => {
    
    const productId = req.params.id;
    Product.findByPk(productId).then(product => {
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

exports.postEditProduct = (req, res) => {
    const {prodId, title, imageUrl, price, description} = req.body;
    req.user.getProducts(
        {where:{id:prodId}
    })
    .then(([product]) => {
        product.title = title,
        product.slug = slugify(title, {lower:true}), 
        product.price = price,
        product.description = description,
        product.imageUrl = imageUrl    
        return product.save();
    })
    .then(() => {
        res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
   
};

exports.getProducts = (req, res) => {
    req.user.getProducts().then(products => {
        res.render("admin/products", {
            pageTitle:"Admin Products", 
            path:"/admin/products",
            products
        })
    }).catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res) => {
    const productId = req.body.productId;
    Product.findByPk(productId).then(product => {
        return product.destroy();
    })
    .then(result => {
        res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
}