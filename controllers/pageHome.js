'use strict'

const { fastify, defOpts } = require("../config");
const { Course } = require("../models/course");
const { Unit } = require("../models/unit");
const { User } = require("../models/user");

fastify.get("/", async (req, res) => {
  const opts = structuredClone(defOpts);
  opts.styles = opts.styles
    .slice(0,1)
    .concat("https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css")
    .concat(opts.styles.slice(1))
    .concat("/static/css/index.css");
  const user = await User.findByJwt(req.cookies.jwt);
  opts.user = user?.dataValues;
  opts.admin = await User.isAdmin(user);
  opts.highlightedCourses = (await Course.findAll({
    where: {
      isAvailable: true,
      isHighlighted: true,
    }
  })).map(course => course.dataValues);
  opts.units = (await Unit.findAll()).map(unit => unit.dataValues);
  return res.render("/index", opts);
});