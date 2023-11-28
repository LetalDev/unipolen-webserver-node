'use strict'

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const Role = sequelize.define("Role", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
});

module.exports = {
  Role
};