'use strict'

const { query, sequelize, getFieldsArrayFromModel, getValuesArrayFromRowFields, getFieldsTypeArrayFromModelFields } = require("../../database");
const { fastify, defOpts } = require("../../config");
const { Course } = require("../../models/course");
const { Unit } = require("../../models/unit");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../../models/user");
const { renderErrorPage, renderErrorPageRes } = require("../pageError");
const { Model } = require("sequelize");




fastify.get("/admin/sql", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }
  
  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;

  return res.render("/admin/sql", opts);
});

fastify.post("/admin/query", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return res.status(401).send();
  }
  if (!(await isUserAdmin(user))) {
    return res.status(403).send();
  }

  try {
    res.headers({"Content-Type": "application: json"})
    .send(await sequelize.query(req.body.query));
  } catch (err) {
    res.headers({"Content-Type": "application: json"})
    .send('{"message": "Ocorreu um erro: ' + err.message.replaceAll('"', "'") + '"}');
  }

});
