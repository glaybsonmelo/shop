const { STRING, FLOAT } = require('sequelize');

const Cart = require("./Cart");
const sequelize = require("../util/database");

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