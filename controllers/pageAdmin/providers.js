'use strict'

const { query, sequelize, getFieldsArrayFromModel, getValuesArrayFromRowFields, getFieldsTypeArrayFromModelFields } = require("../../database");
const { fastify, defOpts } = require("../../config");
const { Unit } = require("../../models/unit");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../../models/user");
const { renderErrorPage, renderErrorPageRes } = require("../pageError");
const { Model } = require("sequelize");
const { object, string, boolean, number } = require("yup");
const { Provider } = require("../../models/provider");
const { uploadFile } = require("../uploadFile");
const fs = require("fs").promises;

const providerFormSchema = object({
  name: string().required().trim(),
  description: string().notRequired().trim(),
  url: string().notRequired().trim(),
});

fastify.get("/admin/provedores", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const providers = await Provider.findAll({
    order: [["name", "ASC"]],
  });

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;
  opts.fields = [
    "id",
    "nome",
    "url",
    "criado em",
    "atualizado em",
  ];

  opts.rows = []

  for (const provider of providers) {
    opts.rows.push({
      id: provider.id,
      hasImage: provider.hasImage,
      values: [
        provider.id,
        provider.name,
        provider.url,
        provider.createdAt,
        provider.updatedAt,
    ]});
  } 

  return res.render("/admin/provedores", opts);
});

fastify.get("/admin/adicionar-provedor", async (req, res) => {
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


  return res.render("admin/adicionar-provedor/index", opts);
});

fastify.post("/admin/adicionar-provedor", async (req, res) => {
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
    let parsed = providerFormSchema.cast(req.body);
    await Provider.create(parsed);

    return res.redirect("/admin/cursos");
  } catch (err) {
    opts.message = "Ocorreu um erro: " + err;
    return res.render("/admin/adicionar-provedor/index", opts);
  }
});

fastify.get("/admin/remover-provedor/:id", async (req, res) => {
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
    const provider = await Provider.findByPk(id);
    await provider.destroy();
    return res.redirect("/admin/provedores");
  } catch (err) {
    return res.redirect("/admin/provedores");
  }
});

fastify.get("/admin/alterar-provedor/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const provider = await Provider.findByPk(id);
  
  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;
  opts.provider = provider.dataValues;

  return res.render("admin/alterar-provedor/index", opts);
});

fastify.post("/admin/alterar-provedor/:id", async (req, res) => {
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

  const provider = await Provider.findByPk(id);

  try {
    let parsed = providerFormSchema.cast(req.body);
    await provider.update(parsed);
    
    return res.redirect("/admin/provedores");
  } catch (err) {
    opts.provider = provider.dataValues;
    opts.message = "Ocorreu um erro: " + err;
    return res.render("/admin/alterar-provedores/index", opts);
  }
});


fastify.get("/admin/alterar-imagem-provedor/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const provider = await Provider.findByPk(id);

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;
  opts.provider = provider.dataValues;

  return res.render("admin/alterar-imagem-provedor/index", opts);
});

fastify.post("/admin/alterar-imagem-provedor/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }
  const { id } = req.params;

  const provider = await Provider.findByPk(id);
  
  const data = await req.file();

  await uploadFile(`./public/img/provider-${id}.jpeg`, data.file);
  await provider.update({hasImage: true});  


  res.redirect("/admin/provedores");
});

fastify.get("/admin/remover-imagem-provedor/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;
  const provider = await Provider.findByPk(id);
  await provider.update({hasImage: false});

  await fs.rm(`./public/img/provider-${id}.jpeg`);

  return res.redirect("/admin/provedores");
});