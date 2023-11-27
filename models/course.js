const { sequelize } = require("../database");
const { DataTypes } = require("sequelize");

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
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
  qualification: {
    type: DataTypes.TEXT,
    defaultValue: "curso livre",
  },
  style: {
    type: DataTypes.ENUM("a distância", "presencial", "híbrido"),
    defaultValue: "a distância",
    allowNull: false,
  },
  isHighlighted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = {
  Course
};