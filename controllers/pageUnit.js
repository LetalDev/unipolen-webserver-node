'use strict'

const { fastify, defOpts } = require("../config");
const { findUserByJwt, isUserAdmin } = require("../models/user");
const { Unit } = require("../models/unit");

fastify.get("/polo/:id", async (req, res) => {
  const { id } = req.params;

  const opts = structuredClone(defOpts);
  const user = await findUserByJwt(req.cookies.jwt);
  const unit = await Unit.findByPk(id);
  opts.user = user?.dataValues;
  opts.admin = await isUserAdmin(user);
  opts.unit = unit.dataValues;

  return res.render("/polo/index", opts);
});