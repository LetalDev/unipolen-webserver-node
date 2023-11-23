'use strict'

const { fastify, defOpts } = require("../fastifyConfig");
const { getAllActiveCourses, getAllCoursesOrdered, addCourse, removeCourse, getCourse, updateCourse } = require("../models/course");
const { getAllUnitsWithAddress, getAllUnitsWithAddressOrdered } = require("../models/unit");
const { isUserAdmin, getUserFromJwt, getAllUsers, getAllUsersOrdered } = require("../models/user");
const { renderErrorPage, renderErrorPageRes } = require("./pageError");
 

fastify.get("/admin", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const courses = await getAllCoursesOrdered();
  const units = await getAllUnitsWithAddressOrdered();
  const users = await getAllUsersOrdered();

  const opts = {
    styles: ["/static/css/admin.css"],
    courses: courses,
    units: units,
    users: users,
  };

  return res.render("/admin/index", opts);
});

fastify.post("/admin/query", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return res.status(401).send();
  }
  if (!(await isUserAdmin(user.id))) {
    return res.status(403).send();
  }

  try {
    res.headers({"Content-Type": "application: json"})
    .send(await query(req.body.query));
  } catch (err) {
    res.headers({"Content-Type": "application: json"})
    .send(`{'message': 'Ocorreu um erro: ${err}'}`);
  }

});


fastify.get("/admin/adicionar-curso", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  return res.render("admin/adicionar-curso/index", opts);

});

fastify.post("/admin/adicionar-curso", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  try {
    const queryResult = await addCourse(
      req.body.name,
      Number.parseInt(req.body.provider_id) || null,
      Number.parseInt(req.body.duration_months),
      Number.parseInt(req.body.hours),
      req.body.is_available,
      req.body.degree,
      req.body.qualification,
      req.body.style,
      req.body.url);

    return res.redirect("/admin");
  } catch (err) {
    opts.message = "Ocorreu um erro: " + err;
    return res.render("/admin/adicionar-curso/index", opts);
  }
});

fastify.get("/admin/remover-curso/:id", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  const { id } = req.params;

  try {
    await removeCourse(id);
    return res.redirect("/admin");
  } catch (err) {
    return res.redirect("/admin");
  }

});

fastify.get("/admin/alterar-curso/:id", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const course = await getCourse(id);
  
  const opts = {
    styles: ["/static/css/admin.css"],
    course: course,
  };

  return res.render("admin/alterar-curso/index", opts);
});

fastify.post("/admin/alterar-curso/:id", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  try {
    await updateCourse(
      Number.parseInt(id),
      req.body.name.trim(),
      Number.parseInt(req.body.provider_id) || null,
      Number.parseInt(req.body.duration_months),
      Number.parseInt(req.body.hours),
      req.body.is_available,
      req.body.degree.trim(),
      req.body.qualification.trim(),
      req.body.style.trim(),
      req.body.url.trim());
    
    return res.redirect("/admin");
  } catch (err) {
    opts.course = await getCourse(id);
    opts.message = "Ocorreu um erro: " + err;
    return res.render("admin/alterar-curso/index", opts);
  }
});