const { fastify, defOpts } = require("../fastifyConfig");
const { getAllUnitsWithAddress } = require("../models/unit");
const { getUserFromJwt, isUserAdmin } = require("../models/user");

fastify.get("/polos", async (req, res) => {
  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/polos.css");
  opts.user = await getUserFromJwt(req.cookies.jwt);
  opts.admin = await isUserAdmin(opts.user.id);
  opts.units = await getAllUnitsWithAddress();
  return res.render("polos/index", opts);
});