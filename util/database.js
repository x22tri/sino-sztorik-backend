const Sequelize = require('sequelize')
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {dialect: 'mysql', logging: false})
console.log(process.env.DB_USER)

module.exports = sequelize