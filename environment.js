'use strict'

require("dotenv").config();

const NODE_ENV = process.env.NODE_ENV;
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || "";
const DOMAIN = process.env.NODE_ENV == "development" ? "localhost" : process.env.DOMAIN || "";
const JWT_ISS = "unipolen";
const PORT = process.env.NODE_ENV == "development" ? 3000 : 80;
const DB_USER = process.env.DB_USER || "";
const DB_HOST = process.env.DB_HOST || "";
const DB_NAME = process.env.DB_NAME || "";
const DB_PASS = process.env.DB_PASS || "";
const DB_PORT = Number.parseInt(process.env.DB_PORT || "-1");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASS = process.env.ADMIN_PASS || "";
const PASS_SALTS = Number.parseInt(process.env.PASS_SALTS || "14");
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL || "";
const NOREPLY_PASS = process.env.NOREPLY_PASS || "";

if (JWT_PRIVATE_KEY == "") {
  throw Error("JWT_PRIVATE_KEY environment variable not set.");
}

if (DOMAIN == "") {
  throw Error("DOMAIN environment variable not set.");
}

if (DB_USER == "") {
  throw Error("DB_USER environment variable not set.");
}

if (DB_HOST == "") {
  throw Error("DB_HOST environment variable not set.");
}

if (DB_NAME == "") {
  throw Error("DB_NAME environment variable not set.");
}

if (DB_PASS == "") {
  throw Error("DB_PASS environment variable not set.");
}

if (DB_PORT == -1) {
  throw Error("DB_PORT environment variable not set.");
}

if (ADMIN_EMAIL == "") {
  throw Error("ADMIN_EMAIL environment variable not set.");
}

if (ADMIN_PASS == "") {
  throw Error("ADMIN_PASS environment variable not set.");
}

if (NOREPLY_EMAIL == "") {
  throw Error("NOREPLY_EMAIL environment variable not set.");
}

if (NOREPLY_PASS == "") {
  throw Error("NOREPLY_PASS environment variable not set");
}


module.exports = {
  NODE_ENV,
  JWT_PRIVATE_KEY,
  DOMAIN,
  JWT_ISS,
  PORT,
  DB_USER,
  DB_HOST,
  DB_NAME,
  DB_PASS,
  DB_PORT,
  ADMIN_EMAIL,
  ADMIN_PASS,
  PASS_SALTS,
  NOREPLY_EMAIL,
  NOREPLY_PASS,
}