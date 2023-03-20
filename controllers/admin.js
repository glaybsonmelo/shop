const slugify = require("slugify");
const Product = require("../models/Product");


exports.getAddProduct = (req, res) => {
    console.log("get",req.user)
    res.render("admin/add-product",  {
        pageTitle:"Add Product",
        path:"/admin/add-product"
    })
}

exports.postAddProduct = (req, res) => {
    const { title, imageUrl, price, description } = req.body;
    const product = new Product({title, slug:slugify(title), price, description, imageUrl});
    product.save()
        .then(() => {
            res.redirect('/');
        })
        .catch(err => console.log(err));
}

// exports.getEditProduct = (req, res) => {
//     const productId = req.params.id;
//     Product.fetchById(productId).then(product => {
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

// exports.postEditProduct = (req, res, next) => {
//     const {prodId, title, imageUrl, price, description} = req.body;
  
//     const product = new Product(
//         prodId,
//         title,
//         price, 
//         description, 
//         imageUrl,

//         );

//     product
//       .save()
//       .then(result => {
//         console.log('UPDATED PRODUCT!');
//         res.redirect('/admin/products');
//       })
//       .catch(err => console.log(err));
//   };


// exports.getProducts = (req, res) => {
//     Product.fetchAll().then(products => {
//         res.render("admin/products", {
//             pageTitle:"Admin Products", 
//             path:"/admin/products",
//             products
//         })
//     }).catch(err => console.log(err));
// }

// exports.postDeleteProduct = (req, res) => {
//     const productId = req.body.productId;
//     Product.deleteById(productId)
//     .then(() => {
//         res.redirect("/admin/products");
//     })
//     .catch(err => console.log(err));
// }