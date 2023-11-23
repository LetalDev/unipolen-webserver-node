const { preparedQuery } = require("../database");

async function getAllUnitsWithAddress() {
  return (await preparedQuery(
    `SELECT * FROM unit
      INNER JOIN unit_address ON (unit.address_id = unit_address.id);`
  )).rows;
}

async function getAllUnitsWithAddressOrdered() {
  return (await preparedQuery(
    `SELECT * FROM unit
      INNER JOIN unit_address ON (unit.address_id = unit_address.id) ORDER BY unit.id ASC;`
  )).rows;
}

module.exports = {
  getAllUnitsWithAddress,
  getAllUnitsWithAddressOrdered,
}