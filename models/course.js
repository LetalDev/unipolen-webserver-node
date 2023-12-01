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
    label: "nome",
  },
  isHighlighted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    label: "em destaque",
  },
  durationMonths: {
    type: DataTypes.SMALLINT,
    label: "duração (meses)",
  },
  hours: {
    type: DataTypes.INTEGER,
    label: "carga horária",
  },
  url: {
    type: DataTypes.TEXT,
    unique: true,
    label: "url",
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    label: "disponibilidade",
  },
  degree: {
    type: DataTypes.TEXT,
    label: "grau",
  },
  qualification: {
    type: DataTypes.TEXT,
    defaultValue: "curso livre",
    label: "qualificação",
  },
  style: {
    type: DataTypes.ENUM("a distância", "presencial", "híbrido"),
    allowNull: false,
    label: "modalidade",
  },
  description: {
    type: DataTypes.TEXT,
    label: "descrição",
  }
});

module.exports = {
  Course,
};