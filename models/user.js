'use strict'

const { sequelize } = require("../database");
const { DataTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const { JWT_PRIVATE_KEY, JWT_ISS } = require("../environment");
const { Role } = require("./role");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  displayName: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

async function findUserByJwt(jwtStr) {
  if (!jwtStr || jwtStr == "") {
    return null;
  }

  let token = jwt.verify(jwtStr, JWT_PRIVATE_KEY);
  
  if (token.iss != JWT_ISS) {
    return null;
  }

  if (!token.sub) {
    return null;
  }

  return await User.findByPk(token.sub);
}

async function findUserByEmail(email) {
  if (!email || email == "") return null;
  return await User.findOne({ where: {email: email} });
}

async function isUserAdmin(user) {
  if (!(user instanceof User)) return false;
  const roles = await user.getRoles();
  for (let role of roles) {
    if (role.name == "admin") return true;
  }
  return false;
}

module.exports = {
  User,
  findUserByJwt,
  findUserByEmail,
  isUserAdmin,
};