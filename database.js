'use strict'

const { Sequelize } = require("sequelize");
const { DB_NAME, DB_PASS, DB_USER, DB_HOST, DB_PORT, NODE_ENV } = require("./environment");

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  sync: {
    force: false,
    alter: false,
  },
  pool: {
    max: 50,
    min: 0,
    acquire: 60000,
    idle: 30000,
  },
  define: {
    chraset: "utf8",
    dialectOptions: {
      collate: "utf8-general-ci"
    },
    timestamps: true,
  },
});

async function setupDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Unable to connect to database: " + err);
  }
}

async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log("Database Synced Successfully");
  } catch (err) {
    console.error("Unable to sync database: " + err);
  }
}

module.exports = { sequelize, setupDatabase, syncDatabase };