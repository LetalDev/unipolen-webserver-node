const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const CustomerUser = sequelize.define("CustomerUser", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  displayName: {
    type: DataTypes.TEXT,
  },
  fullLegalName: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.TEXT,
  },
  rg: {
    type: DataTypes.TEXT,
  },
  country: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  state: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  postalCode: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  nationality: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  naturality: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  legalGender: {
    type: DataTypes.ENUM("male", "female"),
    allowNull: false,
  },
  specialNeeds: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  phone: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  phoneExtra: {
    type: DataTypes.TEXT,
  },
  allowNewsletter: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  getToKnowCompanyDesc: {
    type: DataTypes.TEXT,
  },
  doubtsAboutService: {
    type: DataTypes.TEXT,
  }
});

module.exports = {
  CustomerUser,
};