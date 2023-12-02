'use strict'

const { sequelize } = require("../database");
const { DataTypes } = require("sequelize");

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  // TODO
  // alias: {
  //   type: DataTypes.TEXT,
  //   unique: true,
  // },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isHighlighted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  durationMonths: {
    type: DataTypes.SMALLINT,
  },
  hours: {
    type: DataTypes.INTEGER,
  },
  url: {
    type: DataTypes.TEXT,
    unique: true,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  degree: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.TEXT,
    defaultValue: "curso livre",
  },
  style: {
    type: DataTypes.ENUM("a distância", "presencial", "híbrido"),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  hasImage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

module.exports = {
  Course,
};