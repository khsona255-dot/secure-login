const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LoginAttempt = sequelize.define("LoginAttempt", {
  userId: DataTypes.INTEGER,
  ipAddress: DataTypes.STRING,
  status: DataTypes.STRING,
});

module.exports = LoginAttempt;