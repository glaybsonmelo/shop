const slugify = require("slugify");
const { mongoConnect, getDb } = require("../util/database");
const mongodb = require('mongodb');

class Product{
    constructor(id, title, price, description, imageUrl){

        this._id = id;
        this.title = title;
        this.slug = slugify(title, {lower:true});
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
    }
    save() {
        const db = getDb();
        let dbOp;
        if (this._id) {
          dbOp = db
            .collection('products')
            .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this});
        } else {
          dbOp = db.collection('products').insertOne(this);
        }
        return dbOp
          .then(result => {
            console.log(result);
          })
          .catch(err => {
            console.log(err);
          });
      }
    static fetchAll(){
        let db = getDb();
        return db.collection("products").find().toArray().then(products => {
            return products
        }).catch(err => console.log(err));
    }
    static fetchById(id){
        const db = getDb();
        return db.collection('products').find({_id: new mongodb.ObjectId(id)}).next().then(product => {
            // console.log("Prod in MODEL: ", product, new mongodb.ObjectId(id))
            return product;
        })
    }
    static fetchBySlug(slug){
        const db = getDb();
        return db.collection('products').find({slug:slug}).next().then(product => {
            return product;
        })
    }
}


module.exports = Product;