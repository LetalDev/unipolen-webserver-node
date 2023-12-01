'use strict'

const { fastify, defOpts } = require("../config");
const { Provider } = require("../models/provider");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../models/user");

fastify.get("/parceiros", async (req, res) => {
  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/parceiros.css");
  const user = await findUserByJwt(req.cookies.jwt);
  opts.user = user?.dataValues;
  opts.admin = await isUserAdmin(user);
  opts.providers = (await Provider.findAll()).map(provider => provider.dataValues);
  return res.render("parceiros/index", opts);
});