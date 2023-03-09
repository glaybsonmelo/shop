const sequelize = require("../util/database");
const { STRING, INTEGER } = require("sequelize");
const Product = require("./Product");

const User = sequelize.define("users", {
    name:{
        type: STRING,
        allowNull: false
    },
    email:{
        type: STRING,
        allowNull: false
    },
    password:{
        type: STRING,
        allowNull: false
    }
});

module.exports = User;