const path = require("path");
const fs = require("fs");

const p = path.join(
    path.dirname(require.main.filename),"data", "cart.json"
    );

module.exports = class Cart{
    
    static addProduct(id, productPrice){
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0}

            if(!err){
                cart = JSON.parse(fileContent);
            }
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;

            if(existingProduct){
                updatedProduct = {...existingProduct};
                updatedProduct.qty ++;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct
            }else{
                updatedProduct = {id, qty: 1}
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice += +productPrice;
            fs.writeFile(p, JSON.stringify(cart), (err)=>{
                if(err) console.log(err)
            });
        })
    }
    
    static deleteProduct(id, productPrice){
        console.log(id)
        fs.readFile(p, (err, fileContent) => {
            if(err) return;

            const updatedCart = {...JSON.parse(fileContent) }

            const product = updatedCart.products.find(prod => prod.id === id);

            if(product){
                updatedCart.totalPrice -= product.qty * productPrice;
                updatedCart.products = updatedCart.products.filter(prod => prod.id != id);
                
                fs.writeFile(p, JSON.stringify(updatedCart), err => {
                    console.log(err);
                })
            }

        });
    };
}