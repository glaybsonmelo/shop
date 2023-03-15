const slugify = require("slugify");
const Product = require("../models/Product");
const { getDb } = require("../util/database");


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
            console.log("Success!")
        })
        .catch(err => console.log(err));
}

// exports.getEditProduct = (req, res) => {
    
//     const productId = req.params.id;
//     Product.findByPk(productId).then(product => {
//         if(!product) {
//             res.redirect("/");
//         }
//         res.render("admin/edit-product",{
//             pageTitle:"Edit Product",
//             path:"/admin/products",
//             product
//         });
//     }).catch(err => console.log(err));
// }

// exports.postEditProduct = (req, res) => {
//     const {prodId, title, imageUrl, price, description} = req.body;
//     req.user.getProducts(
//         {where:{id:prodId}
//     })
//     .then(([product]) => {
//         product.title = title,
//         product.slug = slugify(title, {lower:true}), 
//         product.price = price,
//         product.description = description,
//         product.imageUrl = imageUrl    
//         return product.save();
//     })
//     .then(() => {
//         res.redirect("/admin/products");
//     })
//     .catch(err => console.log(err));
   
// };

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