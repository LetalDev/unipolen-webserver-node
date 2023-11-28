'use strict'

const { fastify, defOpts } = require("../config");
const { Unit } = require("../models/unit");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../models/user");

fastify.get("/polos", async (req, res) => {
  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/polos.css");
  const user = await findUserByJwt(req.cookies.jwt);
  opts.user = user?.dataValues;
  opts.admin = await isUserAdmin(user);
  opts.units = (await Unit.findAll()).map(unit => unit.dataValues);
  return res.render("polos/index", opts);
});