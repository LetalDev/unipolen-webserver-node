'use strict'

const { query, sequelize, getFieldsArrayFromModel, getValuesArrayFromRowFields, getFieldsTypeArrayFromModelFields } = require("../../database");
const { fastify, defOpts, updateDefOpts } = require("../../config");
const { Course } = require("../../models/course");
const { Unit } = require("../../models/unit");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../../models/user");
const { renderErrorPage, renderErrorPageRes } = require("../pageError");
const { Model } = require("sequelize");
const { object, string } = require("yup");
const { Defaults } = require("../../models/defaults");
const { uploadFile } = require("../uploadFile");


const infoFormSchema = object({
  name: string().optional().trim(),
  phone: string().optional().trim(),
  email: string().optional().trim(),
});


fastify.get("/admin/componentes", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = structuredClone(defOpts);
  opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;

  return res.render("/admin/componentes", opts);
});


fastify.post("/admin/alterar-informacoes", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  let opts = {};
  
  try {
    const parsed = infoFormSchema.cast(req.body);
    const defaults = await Defaults.findAll();
    for (const formKey in parsed) {
      for (const row of defaults) {
        if (row.key != formKey) continue;
        if (!parsed[formKey]) continue;
        
        await row.update({value: parsed[formKey]});
      }
    }
    await updateDefOpts();
    opts = structuredClone(defOpts)
    opts.showFooter = false;
    opts.styles.push("/static/css/admin.css");
    opts.user = user;
  } catch (err) {
    opts = structuredClone(defOpts)
    opts.showFooter = false;
    opts.styles.push("/static/css/admin.css");
    opts.user = user;
    opts.message = "Ocorreu um erro: " + err;
  }

  return res.render("/admin/componentes", opts);
});


fastify.post("/admin/alterar-logo", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const data = await req.file();

  await uploadFile(`./public/img/logo.png`, data.file);

  res.redirect("/admin/componentes");
});

fastify.post("/admin/alterar-carrossel-1", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const data = await req.file();

  await uploadFile(`./public/img/carousel1.jpeg`, data.file);

  res.redirect("/admin/componentes");
});

fastify.post("/admin/alterar-carrossel-2", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const data = await req.file();

  await uploadFile(`./public/img/carousel2.jpeg`, data.file);

  res.redirect("/admin/componentes");
});

fastify.post("/admin/alterar-carrossel-3", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const data = await req.file();

  await uploadFile(`./public/img/carousel3.jpeg`, data.file);

  res.redirect("/admin/componentes");
});