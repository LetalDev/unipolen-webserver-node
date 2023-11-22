const { preparedQuery } = require("../database");

async function getAllUnitsWithAddress() {
  return (await preparedQuery(
    `SELECT * FROM unit
      INNER JOIN unit_address ON (unit.address_id = unit_address.id);`
  )).rows;
}

module.exports = {
  getAllUnitsWithAddress
}