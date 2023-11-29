const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const AdminUser = sequelize.define("AdminUser", {
  id: {
    type: DataTypes.TEXT,
    allowNull: false,
    primaryKey: true,
  }
});

module.exports = {
  AdminUser,
};