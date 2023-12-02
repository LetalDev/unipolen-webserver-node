'use strict'

const { query, sequelize, getFieldsArrayFromModel, getValuesArrayFromRowFields, getFieldsTypeArrayFromModelFields } = require("../../database");
const { fastify, defOpts } = require("../../config");
const { Course } = require("../../models/course");
const { Unit } = require("../../models/unit");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../../models/user");
const { renderErrorPage, renderErrorPageRes } = require("../pageError");
const { Model } = require("sequelize");
const { object, string, boolean, number } = require("yup");
const { Provider } = require("../../models/provider");

const fs = require('fs').promises
const util = require('node:util')
const { pipeline } = require('node:stream')
const pump = util.promisify(pipeline)




const courseFormSchema = object({
  name: string().required().trim(),
  isHighlighted: boolean().required().transform(val => (val === 'on' ? true : false)).default(false),
  durationMonths: number().positive().integer().nullable().transform(val => (!val ? null : val)),
  hours: number().positive().integer().nullable().transform(val => (!val ? null : val)),
  url: string().nullable().trim(),
  isAvailable: boolean().required().transform(val => (val === 'on' ? true : false)).default(false),
  degree: string().nullable().trim(),
  type: string().nullable().trim(),
  style: string().required().trim(),
  description: string().nullable().trim(),
  ProviderId: string().nullable().trim().transform(val => val === "" ? null : val),
});


fastify.get("/admin/cursos", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const courses = await Course.findAll({
    order: [["name", "ASC"]],
    include: Provider
  });

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;
  
  opts.fields = [
    "id",
    "nome",
    "provedor",
    "em destaque",
    "duração (meses)",
    "carga horária",
    "url",
    "disponibilidade",
    "grau",
    "tipo",
    "modalidade",
    "criado em",
    "atualizado em"
  ];

  opts.rows = []

  for (const course of courses) {
    opts.rows.push({
      id: course.id,
      hasImage: course.hasImage,
      values: [
        course.id,
        course.name,
        course.Provider?.name,
        course.isHighlighted,
        course.durationMonths,
        course.hours,
        course.url,
        course.isAvailable,
        course.degree,
        course.type,
        course.style,
        course.createdAt,
        course.updatedAt,
    ]});
  } 

  return res.render("/admin/cursos", opts);
});




fastify.get("/admin/adicionar-curso", async (req, res) => {
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

  opts.providers = (await Provider.findAll()).map(provider => provider.dataValues);

  return res.render("admin/adicionar-curso/index", opts);

});

fastify.post("/admin/adicionar-curso", async (req, res) => {
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
    let parsed = courseFormSchema.cast(req.body);
    await Course.create(parsed);

    return res.redirect("/admin/cursos");
  } catch (err) {
    opts.providers = (await Provider.findAll()).map(provider => provider.dataValues);
    opts.message = "Ocorreu um erro: " + err;
    return res.render("/admin/adicionar-curso/index", opts);
  }
});

fastify.get("/admin/remover-curso/:id", async (req, res) => {
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
    const course = await Course.findByPk(id);
    await course.destroy();
    return res.redirect("/admin/cursos");
  } catch (err) {
    return res.redirect("/admin/cursos");
  }

});

fastify.get("/admin/alterar-curso/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const course = await Course.findByPk(id);

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;
  opts.course = course.dataValues;
  opts.providers = (await Provider.findAll()).map(provider => provider.dataValues);

  return res.render("admin/alterar-curso/index", opts);
});

fastify.post("/admin/alterar-curso/:id", async (req, res) => {
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

  const course = await Course.findByPk(id);

  try {
    let parsed = courseFormSchema.cast(req.body);
    await course.update(parsed);

    return res.redirect("/admin/cursos");
  } catch (err) {
    opts.course = course.dataValues;
    opts.message = "Ocorreu um erro: " + err;
    opts.providers = (await Provider.findAll()).map(provider => provider.dataValues);
    return res.render("/admin/alterar-curso/index", opts);
  }
});

//alterar imagem

fastify.get("/admin/alterar-imagem-curso/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const course = await Course.findByPk(id);

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;
  opts.course = course.dataValues;

  return res.render("admin/alterar-imagem-curso/index", opts);
});

fastify.post("/admin/alterar-imagem-curso/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }
  const { id } = req.params;

  const course = await Course.findByPk(id);
  
  const data = await req.file();
  const { fileName } = data;

  var buffers = [];
  data.file.on('readable', function (buffer) {
    for (; ;) {
      let buffer = data.file.read();
      if (!buffer) { break; }
      buffers.push(buffer);
    }
  });
  data.file.on('end', async function() {
    var buffer = Buffer.concat(buffers);

    // const savedImage = await course.createImage({
    //   image: buffer
    // });

    await fs.writeFile(`./public/img/course-${id}.jpeg`, buffer);
    await course.update({hasImage: true});
  });
  res.redirect("/admin/cursos");
});

fastify.get("/admin/remover-imagem-curso/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;
  const course = await Course.findByPk(id);
  await course.update({hasImage: false});

  await fs.rm(`./public/img/course-${id}.jpeg`);

  return res.redirect("/admin/cursos");
});