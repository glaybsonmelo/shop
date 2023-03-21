const mongoose = require("mongoose");

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
});

module.exports = mongoose.model("User", userSchema);;