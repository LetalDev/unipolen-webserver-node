'use strict'

const { DataTypes } = require("sequelize");
const { preparedQuery } = require("../database");

const { sequelize } = require("../database");

const Unit = sequelize.define("Unit", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.TEXT,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  hasImage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  }
});

module.exports = {
  Unit
};