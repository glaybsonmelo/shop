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
        mongoConnect.
    }
}

const Product = sequelize.define('products',{
    title:{
        type: STRING,
        allowNull:false
    },
    slug:{
        type: STRING,
        allowNull:false
    },
    price:{
        type: FLOAT,
        allowNull:false
    },
    description:{
        type: STRING,
        allowNull:false
    },
    imageUrl:{
        type: STRING,
        allowNull:false
    }
});


module.exports = Product;