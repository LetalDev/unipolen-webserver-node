'use strict'

const { fastify, defOpts } = require("../fastifyConfig");
const { isUserAdmin, getUserFromJwt } = require("../models/user");
const { renderErrorPage, renderErrorPageRes } = require("./pageError");

fastify.get("/admin", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {styles: ["/static/css/admin.css"]};

  return res.render("/admin/index", opts);
});