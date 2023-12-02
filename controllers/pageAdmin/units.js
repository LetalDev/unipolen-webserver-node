'use strict'

const { query, sequelize, getFieldsArrayFromModel, getValuesArrayFromRowFields, getFieldsTypeArrayFromModelFields } = require("../../database");
const { fastify, defOpts } = require("../../config");
const { Course } = require("../../models/course");
const { Unit } = require("../../models/unit");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../../models/user");
const { renderErrorPage, renderErrorPageRes } = require("../pageError");
const { Model } = require("sequelize");
const { object, string } = require("yup");
const { uploadFile } = require("../uploadFile");
const fs = require("fs").promises;

const unitFormSchema = object({
  name: string().required().trim(),
  phone: string().nullable().trim(),
  address: string().required().trim(),
  description: string().nullable().trim(),
})

fastify.get("/admin/polos", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const units = await Unit.findAll({order: [["updatedAt", "DESC"]]});

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;
  
  const fields = getFieldsArrayFromModel(Unit, {"description":true});
  opts.fields = fields.map(field => (field.label || field.fieldName));
  opts.rows = units.map(unit => {
    return {
      id: unit.id,
      hasImage: unit.hasImage,
      values: getValuesArrayFromRowFields(unit, fields)
    }
  });

  return res.render("/admin/polos", opts);
});



fastify.get("/admin/adicionar-polo", async (req, res) => {
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

  return res.render("admin/adicionar-polo/index", opts);

});

fastify.post("/admin/adicionar-polo", async (req, res) => {
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

  try {
    const parsed = unitFormSchema.cast(req.body);
    const queryResult = await Unit.create(parsed);

    return res.redirect("/admin/polos");
  } catch (err) {
    opts.message = "Ocorreu um erro: " + err;
    return res.render("/admin/adicionar-polo/index", opts);
  }
});

fastify.get("/admin/alterar-polo/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const unit = await Unit.findByPk(id);
  
  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;
  opts.unit = unit.dataValues;

  return res.render("admin/alterar-polo/index", opts);
});

fastify.post("/admin/alterar-polo/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;

  const unit = await Unit.findByPk(id);

  try {
    const parsed = unitFormSchema.cast(req.body);
    await unit.update(parsed);
    
    return res.redirect("/admin/polos");
  } catch (err) {
    opts.unit = unit.dataValues;
    opts.message = "Ocorreu um erro: " + err;
    return res.render("admin/alterar-polo/index", opts);
  }
});

fastify.get("/admin/remover-polo/:id", async (req, res) => {
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

  const { id } = req.params;

  try {
    const unit = await Unit.findByPk(id);
    await unit.destroy();
    return res.redirect("/admin/polos");
  } catch (err) {
    return res.redirect("/admin/polos");
  }

});


fastify.get("/admin/alterar-imagem-polo/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const unit = await Unit.findByPk(id);

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;
  opts.unit = unit.dataValues;

  return res.render("admin/alterar-imagem-polo/index", opts);
});

fastify.post("/admin/alterar-imagem-polo/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }
  const { id } = req.params;

  const unit = await Unit.findByPk(id);
  
  const data = await req.file();

  await uploadFile(`./public/img/unit-${id}.jpeg`, data.file);
  await unit.update({hasImage: true});  


  res.redirect("/admin/polos");
});

fastify.get("/admin/remover-imagem-polo/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;
  const unit = await Unit.findByPk(id);
  await unit.update({hasImage: false});

  await fs.rm(`./public/img/unit-${id}.jpeg`);

  return res.redirect("/admin/polos");
});