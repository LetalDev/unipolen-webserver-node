'use strict'

const { fastify, defOpts } = require("../config");
const { Course } = require("../models/course");
const { findUserByJwt, isUserAdmin } = require("../models/user");

fastify.get("/curso/:id", async (req, res) => {
  const { id } = req.params;

  const opts = structuredClone(defOpts);
  const user = await findUserByJwt(req.cookies.jwt);
  const course = await Course.findByPk(id);

  if (!course) {
    return res.redirect("/courses");
  }

  opts.user = user?.dataValues;
  opts.admin = await isUserAdmin(user);
  opts.course = course.dataValues;

  return res.render("/curso/index", opts);
});