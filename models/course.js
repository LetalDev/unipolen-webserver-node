const { preparedQuery } = require("../database");


async function getActiveCoursesInRange(offset, limit) {
  if (typeof offset != "number" || typeof limit != "number") throw Error();

  return (await preparedQuery(`
    SELECT * FROM course 
    WHERE is_available = true 
    ORDER BY id 
    LIMIT $1 OFFSET $2;`, [limit, offset])).rows;
}

async function getActiveCourseCount() {
  return (await preparedQuery("SELECT COUNT(*) FROM course WHERE is_available = true;")).rows[0].count;
}

module.exports = {
  getActiveCoursesInRange,
  getActiveCourseCount,
}