const { Sequelize } = require("sequelize");

const sequelize = new Sequelize('shop', "root", '', {
    dialect:"mysql",
    host:'localhost'
})
module.exports = sequelize;