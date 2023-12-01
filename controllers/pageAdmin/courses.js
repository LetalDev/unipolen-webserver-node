'use strict'

const { query, sequelize, getFieldsArrayFromModel, getValuesArrayFromRowFields, getFieldsTypeArrayFromModelFields } = require("../../database");
const { fastify, defOpts } = require("../../config");
const { Course } = require("../../models/course");
const { Unit } = require("../../models/unit");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../../models/user");
const { renderErrorPage, renderErrorPageRes } = require("../pageError");
const { Model } = require("sequelize");
const { object, string, boolean, number } = require("yup");




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
});


fastify.get("/admin/cursos", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const courses = await Course.findAll({order: [["name", "ASC"]]});

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;
  
  const fields = getFieldsArrayFromModel(Course, {"description":true});
  opts.fields = fields.map(field => (field.label || field.fieldName));
  opts.rows = courses.map(course => {
    return {
      id: course.id,
      values: getValuesArrayFromRowFields(course, fields)
    }
  });

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
    return res.render("/admin/alterar-curso/index", opts);
  }
});