const { fastify, defOpts } = require("../fastifyConfig");
const { getAllUnitsWithAddress } = require("../models/unit");
const { getUserFromJwt } = require("../models/user");

fastify.get("/polos", async (req, res) => {
  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/polos.css");
  opts.user = await getUserFromJwt(req.cookies.jwt);
  opts.units = await getAllUnitsWithAddress();
  return res.render("polos/index", opts);
});