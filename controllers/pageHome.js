'use strict'

const { fastify, defOpts } = require("../config");
const { Course } = require("../models/course");
const { Unit } = require("../models/unit");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../models/user");

fastify.get("/", async (req, res) => {
  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/index.css");
  const user = await findUserByJwt(req.cookies.jwt);
  opts.user = user?.dataValues;
  opts.admin = await isUserAdmin(user);
  opts.highlightedCourses = (await Course.findAll({
    where: {
      isAvailable: true,
      isHighlighted: true,
    }
  })).map(course => course.dataValues);
  opts.units = (await Unit.findAll()).map(unit => unit.dataValues);
  return res.render("/index", opts);
});