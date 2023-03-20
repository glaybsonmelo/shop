const mongoose = require("mongoose");
const { FLOAT } = require("sequelize");

const Schema = mongoose.Schema;
const productSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    imageUrl: {
        type: String,
        require: true
    },
});

module.exports = mongoose.model("Product", productSchema);