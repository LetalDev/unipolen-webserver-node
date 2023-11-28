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
    label: "nome",
  },
  phone: {
    type: DataTypes.TEXT,
    label: "telefone",
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    label: "endereço",
  },
  description: {
    type: DataTypes.TEXT,
    label: "descrição"
  }
});

module.exports = {
  Unit
};