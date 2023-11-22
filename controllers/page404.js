const { fastify } = require("../fastifyConfig");
const { renderErrorPageRes } = require("./pageError");

fastify.get("*", async (req, res) => {
  return await renderErrorPageRes(res, 404);
});