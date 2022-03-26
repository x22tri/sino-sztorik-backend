const Sequelize = require('sequelize')
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {dialect: 'mysql', logging: false})
console.log('name user pw' + process.env.DB_NAME + process.env.DB_USER + process.env.DB_PASSWORD)
console.log('port' + process.env.PORT)
console.log('frontend' + process.env.FRONTEND_URL)

module.exports = sequelize