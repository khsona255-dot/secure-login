const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    unique: true,
  },

  password: DataTypes.STRING,

  role: {
    type: DataTypes.STRING,
    defaultValue: "user",
  },

  lockUntil: DataTypes.DATE,

  lockCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  throttleCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  nextAllowedAt: {
    type: DataTypes.DATE,
  },
});

module.exports = User;