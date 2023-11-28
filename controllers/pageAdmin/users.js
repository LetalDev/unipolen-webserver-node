'use strict'

const { query, sequelize, getFieldsArrayFromModel, getValuesArrayFromRowFields, getFieldsTypeArrayFromModelFields } = require("../../database");
const { fastify, defOpts } = require("../../config");
const { Course } = require("../../models/course");
const { Unit } = require("../../models/unit");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../../models/user");
const { renderErrorPage, renderErrorPageRes } = require("../pageError");
const { Model } = require("sequelize");




fastify.get("/admin/usuarios", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const users = await User.findAll();

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;

  const fields = getFieldsArrayFromModel(User, {"passwordHash":true});
  opts.fields = fields.map(field => (field.label || field.fieldName));
  opts.rows = users.map(user => {
    return {
      id: user.id,
      values: getValuesArrayFromRowFields(user, fields)
    }
  });

  return res.render("/admin/usuarios", opts);
});