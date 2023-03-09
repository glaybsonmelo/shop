const { INTEGER } = require("sequelize");
const sequelize = require("../util/database");

const CartItem = sequelize.define("cartItems", {
    quantity: INTEGER
});

module.exports = CartItem;