const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const OrderItem = sequelize.define('orderItems', {
    quantity: Sequelize.INTEGER
});

module.exports = OrderItem;