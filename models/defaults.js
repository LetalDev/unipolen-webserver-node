'use strict'

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const Defaults = sequelize.define("Defaults", {
  key: {
    type: DataTypes.TEXT,
    allowNull: false,
    primaryKey: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = {
  Defaults,
};