'use strict'

const { sequelize } = require("../database");
const { DataTypes, Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { JWT_PRIVATE_KEY, JWT_ISS } = require("../environment");

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
  passwordHash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
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
  return (await user.getAdminUser()) ? true : false;
}

async function removeLongLastingInactiveUsers() {
  const users = await User.findAll({where: {
    isActive: false,
    updatedAt: {
      [Op.lt]: new Date(Date.now() - 1000*60*60*24*30) //30 days
    }
  }});
  for (const user of users) {
    user.destroy();
  }
}

module.exports = {
  User,
  findUserByJwt,
  findUserByEmail,
  isUserAdmin,
  removeLongLastingInactiveUsers
};