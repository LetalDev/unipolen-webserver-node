const { fastify } = require("../fastifyConfig");
const { query } = require("../database");

fastify.post("/admin/query", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return res.status(401).send();
  }
  if (!(await isUserAdmin(user.id))) {
    return res.status(403).send();
  }

  res.headers({"Content-Type": "application: json"})
    .send(await query(req.body.query));

});