'use strict'

const { Sequelize, Model } = require("sequelize");
const { DB_NAME, DB_PASS, DB_USER, DB_HOST, DB_PORT, NODE_ENV } = require("./environment");

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  sync: {
    force: false,
    alter: true,
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
  logging: false,
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

/**
 * @param {import("sequelize").ModelCtor<Model<any, any>>} model
 * @param {object} [blacklist={}] 
 * @returns {import("sequelize").ModelAttributeColumnOptions<Model<any, any>>[]}
 */
function getFieldsArrayFromModel(model, blacklist = {}) {
  const fieldsObj = model.getAttributes();
  const fields = [];
  for (const field in fieldsObj) {
    if (blacklist[field]) continue;
    fields.push(fieldsObj[field]);
  }
  return fields;
}

/**
 * @param {Model<any, any>} row 
 * @param {import("sequelize").ModelAttributeColumnOptions<Model<any, any>>[]} fields 
 * @returns {any[]}
 */
function getValuesArrayFromRowFields(row, fields) {
  let values = [];
  for (const field of fields) {
    values.push(row[field.fieldName]);
  }
  return values;
}
 

module.exports = {
  sequelize,
  setupDatabase,
  syncDatabase,
  getFieldsArrayFromModel,
  getValuesArrayFromRowFields,
};