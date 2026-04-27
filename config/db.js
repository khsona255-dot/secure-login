const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("secure_login", "root", "sona@123", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;