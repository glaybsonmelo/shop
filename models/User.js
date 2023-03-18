const Product = require("./Product");
const mongodb = require("mongodb");
const { getDb } = require("../util/database");

class User {
    constructor(id, name, email, password, cart){
        this.name = name;
        this.email = email;
        this.password = password;
        this.cart = cart;
        this.id = id;
    }

    save(){
        const db = getDb() 
        return db.collection('users').insertOne(this);
    }

    addToCart(product){

        const cartProductIndex = this.cart.items.findIndex(prod  => prod.productId.toString() === product._id.toString());
        let newQuantity = 1;
        const updatedCartitems = [...this.cart.items]

        if(cartProductIndex >= 0){
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartitems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartitems.push({productId: new mongodb.ObjectId(product._id), quantity: newQuantity})
        } 
        // this.cart.quantity = 1;
        const updatedCart = {items:updatedCartitems}
        const db = getDb()
        return db.collection("users").updateOne(
            { _id: new mongodb.ObjectId(this.id) },
            { $set: { cart: updatedCart } }
        );
    }
    
    static findById(id){
        const db = getDb();
        const user = db.collection("users").findOne({_id: new mongodb.ObjectId(id)});
        return user;
    }
    
    getCart(){
        const db = getDb();
        const productIds = this.cart.items.map(i => i.productId);
        return db.collection("products").find({_id:{$in: productIds}}).toArray().then(products => {
            return products.map(p => {
                return {
                    ...p,
                     quantity: this.cart.items.find(i => i.productId.toString() === p._id.toString()).quantity
                    }
            })
        });
    }
}

module.exports = User;