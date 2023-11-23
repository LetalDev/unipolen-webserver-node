'use strict'

const { JWT_PRIVATE_KEY, JWT_ISS } = require("../environment");
const { preparedQuery } = require("../database");
const jwt = require("jsonwebtoken");

function getUserIdFromJwt(tokenStr) {
  if (tokenStr == undefined || tokenStr == "") {
    return undefined;
  }

  let token = jwt.verify(tokenStr, JWT_PRIVATE_KEY);
  
  if (token.iss != JWT_ISS) {
    return undefined;
  }

  if (token.sub == undefined) {
    return undefined;
  }

  return token.sub;
}

async function getUserFromJwt(tokenStr) {
  const name = getUserIdFromJwt(tokenStr);
  if (name == undefined) return undefined;
  return (await preparedQuery("SELECT * FROM public.user WHERE id = $1;", [name])).rows[0];
}

async function getUserFromEmail(email) {
  return (await preparedQuery(
    `SELECT * FROM public.user WHERE email = $1;`, [email]
  )).rows[0];
}

async function isUserAdmin(userId) {
  return (await preparedQuery(
    `SELECT COUNT(*) FROM user_role
      INNER JOIN role ON (user_role.role_id = role.id)
      WHERE role.name = 'admin' AND user_role.user_id = $1;`, [userId])).rows[0].count > 0;
}

async function createUser(email, displayName, passwordHash) {
  return (await preparedQuery(
    `INSERT INTO public.user (email, display_name, password_hash) VALUES ($1, $2, $3);`, [email, displayName, passwordHash]
  )).rowCount > 0;
}

async function updateUserEmail(userId, email) {
  return (await preparedQuery(
    `UPDATE public.user SET email = $1 WHERE id = $2`, [email, userId]
  )).rowCount > 0;
}

async function updateUserDisplayName(userId, displayName) {
  return (await preparedQuery(
    `UPDATE public.user SET display_name = $1 WHERE id = $2`, [displayName, userId]
  )).rowCount > 0;
}

async function updateUserPasswordHash(userId, passwordHash) {
  return (await preparedQuery(
    `UPDATE public.user SET password_hash = $1 WHERE id = $2`, [passwordHash, userId]
  )).rowCount > 0;
}

async function getAllUsers() {
  return (await preparedQuery("SELECT * FROM public.user;")).rows;
}

async function getAllUsersOrdered() {
  return (await preparedQuery("SELECT * FROM public.user ORDER BY id ASC;")).rows;
}


module.exports = {
  getUserIdFromJwt,
  getUserFromJwt,
  getUserFromEmail,
  createUser,
  updateUserDisplayName,
  updateUserEmail,
  updateUserPasswordHash,
  isUserAdmin,
  getAllUsers,
  getAllUsersOrdered,
}