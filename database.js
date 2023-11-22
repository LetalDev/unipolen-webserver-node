'use strict'

const { Pool, Client } =  require('pg');
const { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER } = require("./environment");

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASS,
  port: DB_PORT,
});

async function query(q) {
  if (typeof q != "string") throw Error();
  const client = await pool.connect();
  try {
    return await client.query(q);
  } finally {
    client.release();
  }
}

async function preparedQuery(q, values) {
  if (typeof q != "string") throw Error();
  const client = await pool.connect();
  try {
    return await client.query(q, values);
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  preparedQuery,
}