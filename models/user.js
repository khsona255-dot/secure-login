const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: DataTypes.STRING,

  lockUntil: DataTypes.DATE,

  lockCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = User;