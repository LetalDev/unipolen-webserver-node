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
  }
});


module.exports = {
  Provider,
}