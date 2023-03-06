const fs = require("fs");
const path = require("path");

const slugify = require('slugify');
const { v4 }  = require('uuid');

const p = path.join(path.dirname(require.main.filename), "data", "products.json");

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
    constructor(id, title, imageUrl, price, description){
        this.id = id;
        this.title = title;
        this.slug = slugify(title, {lower:true});
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }
    save(){
        getPrductsFromFile(products => {

            if(this.id){
                let existingProductIndex = products.findIndex(prod => prod.id === this.id);
                console.log(existingProductIndex)
                
                const updatedProducts = [...products]
                updatedProducts[existingProductIndex] = this;

                fs.writeFile(p, JSON.stringify(updatedProducts), error => {
                    if(error)
                        console.log(error)
                });
                
            }
            else{
                this.id = v4();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), error => {
                    if(error)
                        console.log(error)
                });
            }
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
            const product = products.find(prod => prod.id === id);
            if(product) 
                callback(product);
            else callback([]);
        })
        
    }
}