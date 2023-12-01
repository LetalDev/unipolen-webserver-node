'use strict'

const { sequelize } = require("../database");
const { DataTypes } = require("sequelize");

const Image = sequelize.define("Image", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    image: {
        type: DataTypes.BLOB,
        allowNull: false
    },
});

module.exports = {
    Image,
  };