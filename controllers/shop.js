const Product = require("../models/Product");
const Cart = require("../models/Cart");

exports.getIndex = (req, res) => {
    Product.findAll().then(products => {
        res.render("shop/index", {
            products,
            pageTitle:"Products",
            path:"/"
        })
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    });;
};

exports.getProduct = (req, res) => {
    const slug = req.params.slug;
    Product.findOne({
        where:{slug}
    }).then(product => {
        res.render("shop/product-detail", {
            pageTitle:product.title,
            path:"/products",
            product:product
        });
    }).catch(err => console.log(err));
};

exports.getProducts = (req, res) => {
    Product.findAll().then(products => {
        res.render("shop/product-list", {
            products,
            pageTitle:"Products",
            path:"/products"
        })
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    });;
};

exports.getCart = (req, res) => {
    Cart.getCart(cart => {
        Product.findAll(products => {
            const cartProducts = [];
            // filter all products if exists in cart
            for(product of products){
                const cartProductData = cart.products.find(prod => prod.id == product.id);

                if(cartProductData){
                    cartProducts.push({productData: product, qty:cartProductData.qty});
                }
            }
            res.render("shop/cart", {
                pageTitle:"Your Cart",
                path:"/cart",
                products:cartProducts, 
                totalPrice: cart.totalPrice
            });
        })
    })
}

exports.postCart = (req, res) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        Cart.addProduct(productId, product.price);
        res.redirect("/cart");
    })
}

exports.postCartDeleteProduct = (req, res) => {
    const prodId = req.body.prodId;
    Product.findById(prodId, product => {
        console.log(product)
        if(product){
            Cart.deleteProduct(prodId, product.price);
            res.redirect("/cart");
        }else res.redirect("/cart");
    })
}

exports.getOrders = (req, res) => {
    res.render("shop/orders", {pageTitle:"Your Orders", path:"/orders"})
}

exports.getCheckout = (req, res) => {
    res.render("shop/checkout", {pageTitle: "Checkout", path:""});
}
