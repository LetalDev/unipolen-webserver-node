const { preparedQuery } = require("../database");

async function getAllUnits() {
  return (await preparedQuery(
    `SELECT * FROM unit;`
  )).rows;
}

async function getAllUnitsOrdered() {
  return (await preparedQuery(
    `SELECT * FROM unit ORDER BY id ASC;`
  )).rows;
}

async function addUnit(name, phone, address) {
  return (await preparedQuery(
    `INSERT INTO unit (name, phone, address)
      VALUES ($1, $2, $3)`, [name, phone, address]
  ));
}

async function getUnit(id) {
  return (await preparedQuery(
    `SELECT * FROM unit WHERE id = $1`, [id]
  )).rows[0];
}

async function removeUnit(id) {
  return (await preparedQuery(
    `DELETE FROM unit WHERE id = $1`, [id]
  ));
}

async function updateUnit(id, name, phone, address) {
  return (await preparedQuery(
    `UPDATE unit SET name = $1, phone = $2, address = $3 WHERE id = $4`, [name, phone, address, id]
  ));
}

module.exports = {
  getAllUnits,
  getAllUnitsOrdered,
  addUnit,
  getUnit,
  removeUnit,
  updateUnit
}