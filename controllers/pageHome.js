'use strict'

const { fastify, defOpts } = require("../config");
const { getHighlightedCourses } = require("../models/course");
const { getAllUnitsOrdered } = require("../models/unit");
const { getUserFromJwt, isUserAdmin } = require("../models/user");

fastify.get("/", async (req, res) => {
  const opts = structuredClone(defOpts);
  opts.styles = opts.styles
    .slice(0,1)
    .concat("https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css")
    .concat(opts.styles.slice(1))
    .concat("/static/css/index.css");
  opts.user = await getUserFromJwt(req.cookies.jwt);
  opts.admin = await isUserAdmin(opts.user?.id);
  opts.highlighted_courses = await getHighlightedCourses();
  opts.units = await getAllUnitsOrdered();
  return res.render("/index", opts);
});