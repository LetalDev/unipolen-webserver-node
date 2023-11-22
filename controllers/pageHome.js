'use strict'

const { fastify, defOpts } = require("../fastifyConfig");
const { getUserFromJwt } = require("../models/user");

fastify.get("/", async (req, res) => {
  const opts = structuredClone(defOpts);
  opts.styles = opts.styles
    .slice(0,1)
    .concat("https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css")
    .concat(opts.styles.slice(1))
    .concat("/static/css/index.css");
  opts.user = await getUserFromJwt(req.cookies.jwt);
  return res.render("/index", opts);
});