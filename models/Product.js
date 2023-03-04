const fs = require("fs");
const path = require("path");
const { abort } = require("process");

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
    constructor(title){
        this.title = title;
    }
    save(){
        getPrductsFromFile(products => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), error => {
                console.log(error)
            });
        })

    }
    static findAll(callback){
        getPrductsFromFile(callback);
    }
}