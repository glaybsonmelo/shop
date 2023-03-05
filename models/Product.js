const fs = require("fs");
const path = require("path");
const slugify = require('slugify');
const p = path.join(path.dirname(require.main.filename), "data", "products.json");
const { v4 }  = require('uuid');

const getPrductsFromFile = callback => {
    fs.readFile(p, async (err, fileContent) => {
        if(err){
            console.log(err)
            return callback([], p);
        }
        else {
            callback(JSON.parse(fileContent))
        };
    });
}

module.exports = class Product{
    constructor(title, imageUrl, price, description){
        this.id = 0;
        this.title = title;
        this.slug = slugify(title, {lower:true});
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }
    save(){
        this.id = v4();
        getPrductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), error => {
                if(error)
                    console.log(error)
            });
        })

    }
    static findAll(callback){
        getPrductsFromFile(callback);
    }
    static findBySlug(slug, callback){
        getPrductsFromFile(products => {
            const product = products.find(p => p.slug == slug);
            callback(product);
        })
    }
    static findById(id, callback){
        getPrductsFromFile(products => {
            const product = products.find(p => p.id == id);
            if(product) 
                callback(product);
            else callback([]);
        })
        
    }
}