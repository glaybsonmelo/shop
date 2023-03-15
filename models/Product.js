const slugify = require("slugify");
const { mongoConnect, getDb } = require("../util/database");


class Product{
    constructor(title, price, description, imageUrl){
        this.title = title;
        this.slug = slugify(title, {lower:true});
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
    }
    save(){
        let db = getDb();
        return db.collection("products").insertOne(this)
            .then(() => console.log("Product saved!"))
            .catch(err => console.log(err));
    }
    static fetchAll(){
        let db = getDb();
        return db.collection("products").find().toArray().then(products => {
            return products
        }).catch(err => console.log(err));
    }
    static fetchById(id){
        const db = getDb();
        return db.collection('products').find({id:id}).thne(product => {
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