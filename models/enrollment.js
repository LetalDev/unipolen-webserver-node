'use strict'

const { DataTypes } = require("sequelize");
const { sequelize } = require("../database")

const Enrollment = sequelize.define("Enrollment", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  status: {
    type: DataTypes.ENUM("em espera", "aceito", "rejeitado", "completo"),
    allowNull: false,
    defaultValue: "em espera"
  }
});

module.exports = {
  Enrollment,
};