'use strict'

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database")

const Provider = sequelize.define("Provider", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hasImage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  url: {
    type: DataTypes.TEXT,
  },
});


module.exports = {
  Provider,
}