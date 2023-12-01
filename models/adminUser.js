const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const AdminUser = sequelize.define("AdminUser", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  }
});

module.exports = {
  AdminUser,
};