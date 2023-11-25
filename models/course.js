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

async function getAllActiveCourses() {
  return (await preparedQuery("SELECT * FROM course;")).rows;
}

async function getAllCoursesOrdered() {
  return (await preparedQuery("SELECT * FROM course ORDER BY id ASC;")).rows;
}

async function addCourse(name, provider_id, duration_months, hours, is_available, degree, qualification, style, url, is_highlighted) {
  return (await preparedQuery(
    `INSERT INTO course (name, provider_id, duration_months, hours, is_available, degree, qualification, style, url, is_highlighted)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [name, provider_id, duration_months, hours, is_available, degree, qualification, style, url, is_highlighted]));
}

async function removeCourse(id) {
  return (await preparedQuery("DELETE FROM course WHERE id = $1", [id]));
}

async function getCourse(id) {
  return (await preparedQuery("SELECT * FROM course WHERE id = $1", [id])).rows[0];
}

async function updateCourse(id, name, provider_id, duration_months, hours, is_available, degree, qualification, style, url, is_highlighted) {
  return (await preparedQuery(
    `UPDATE course SET
      name = $1,
      provider_id = $2,
      duration_months = $3,
      hours = $4,
      is_available = $5,
      degree = $6,
      qualification = $7,
      style = $8,
      url = $9,
      is_highlighted = $10
      WHERE id = $11`, [name, provider_id, duration_months, hours, is_available, degree, qualification, style, url, is_highlighted, id]
  ));
}

async function getHighlightedCourses() {
  return (await preparedQuery(
    `SELECT * FROM course WHERE is_highlighted = true;`
  )).rows;
}

module.exports = {
  getActiveCoursesInRange,
  getActiveCourseCount,
  getAllActiveCourses,
  getAllCoursesOrdered,
  addCourse,
  removeCourse,
  getCourse,
  updateCourse,
  getHighlightedCourses
}