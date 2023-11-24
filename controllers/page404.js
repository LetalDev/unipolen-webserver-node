const { fastify } = require("../config");
const { renderErrorPageRes } = require("./pageError");

fastify.get("*", async (req, res) => {
  return await renderErrorPageRes(res, 404);
});