const mongoose = require("mongoose");
const Product = require("./Product");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    email:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    cart:{
        items: [{
            productId:{type: Schema.Types.ObjectId, ref: 'Product' , require: true},
            quantity: {type: Number, require: true}
        }]
    }
});

userSchema.methods.clearCart = function(){
    this.cart = { items: [] };
    return this.save();
}

userSchema.methods.removeFromCart = function(prodId){
    const updatedCartItems = this.cart.items.filter(prod => prod.productId.toString() != prodId.toString());
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity
        });
    }
    const updatedCart = {
        items: updatedCartItems
    };
    
    this.cart = updatedCart;
    return this.save();
}

module.exports = mongoose.model("User", userSchema);;