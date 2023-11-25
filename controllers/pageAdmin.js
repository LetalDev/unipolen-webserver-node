'use strict'

const { query } = require("../database");
const { fastify, defOpts } = require("../config");
const { getAllActiveCourses, getAllCoursesOrdered, addCourse, removeCourse, getCourse, updateCourse } = require("../models/course");
const { getAllUnitsOrdered, addUnit, getUnit, updateUnit, removeUnit } = require("../models/unit");
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

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  return res.render("/admin/index", opts);
});

fastify.get("/admin/componentes", async (req, res) => {
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

  return res.render("/admin/componentes", opts);
});

fastify.get("/admin/cursos", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const courses = await getAllCoursesOrdered();

  const opts = {
    styles: ["/static/css/admin.css"],
    courses: courses,
  };

  return res.render("/admin/cursos", opts);
});

fastify.get("/admin/polos", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const units = await getAllUnitsOrdered();

  const opts = {
    styles: ["/static/css/admin.css"],
    units: units,
  };

  return res.render("/admin/polos", opts);
});

fastify.get("/admin/usuarios", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const users = await getAllUsersOrdered();

  const opts = {
    styles: ["/static/css/admin.css"],
    users: users,
  };

  return res.render("/admin/usuarios", opts);
});

fastify.get("/admin/sql", async (req, res) => {
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

  return res.render("/admin/sql", opts);
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
    .send('{"message": "Ocorreu um erro: ' + err.message.replaceAll('"', "'") + '"}');
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

  let name = (req.body.name || "").trim();
  if (name === "") name = null;
  let provider_id = Number.parseInt(req.body.provider_id) || null
  let duration_months = Number.parseInt(req.body.duration_months) || null;
  let hours = Number.parseInt(req.body.hours) || null;
  let is_available = req.body.is_available || false;
  let degree = (req.body.degree || "").trim();
  if (degree === "") degree = null;
  let qualification = (req.body.qualification || "").trim();
  if (qualification === "") qualification = null;
  let style = (req.body.style || "").trim();
  if (style === "") style = null;
  let is_highlighted = req.body.is_highlighted || false;
  let url = (req.body.url || "").trim();
  if (url === "") url = null;

  try {
    const queryResult = await addCourse(
      name,
      provider_id,
      duration_months,
      hours,
      is_available,
      degree,
      qualification,
      style,
      url,
      is_highlighted
      );

    return res.redirect("/admin/cursos");
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
    return res.redirect("/admin/cursos");
  } catch (err) {
    return res.redirect("/admin/cursos");
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

  let name = (req.body.name || "").trim();
  if (name === "") name = null;
  let provider_id = Number.parseInt(req.body.provider_id) || null
  let duration_months = Number.parseInt(req.body.duration_months) || null;
  let hours = Number.parseInt(req.body.hours) || null;
  let is_available = req.body.is_available || false;
  let degree = (req.body.degree || "").trim();
  if (degree === "") degree = null;
  let qualification = (req.body.qualification || "").trim();
  if (qualification === "") qualification = null;
  let style = (req.body.style || "").trim();
  if (style === "") style = null;
  let is_highlighted = req.body.is_highlighted || false;
  let url = (req.body.url || "").trim();
  if (url === "") url = null;

  try {
    await updateCourse(
      Number.parseInt(id),
      name,
      provider_id,
      duration_months,
      hours,
      is_available,
      degree,
      qualification,
      style,
      url,
      is_highlighted
      );
    
    return res.redirect("/admin/cursos");
  } catch (err) {
    opts.course = await getCourse(id);
    opts.message = "Ocorreu um erro: " + err;
    return res.render("admin/alterar-curso/index", opts);
  }
});

fastify.get("/admin/adicionar-polo", async (req, res) => {
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

  return res.render("admin/adicionar-polo/index", opts);

});

fastify.post("/admin/adicionar-polo", async (req, res) => {
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

  let name = (req.body.name || "").trim();
  if (name === "") name = null;
  let phone = (req.body.phone || "").trim();
  if (phone === "") phone = null;
  let address = (req.body.address || "").trim();
  if (address === "") address = null;

  try {
    const queryResult = await addUnit(
      name,
      phone,
      address
    );

    return res.redirect("/admin/polos");
  } catch (err) {
    opts.message = "Ocorreu um erro: " + err;
    return res.render("/admin/adicionar-polo/index", opts);
  }
});

fastify.get("/admin/alterar-polo/:id", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user.id))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const unit = await getUnit(id);
  
  const opts = {
    styles: ["/static/css/admin.css"],
    unit: unit,
  };

  return res.render("admin/alterar-polo/index", opts);
});

fastify.post("/admin/alterar-polo/:id", async (req, res) => {
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

  let name = (req.body.name || "").trim();
  if (name === "") name = null;
  let phone = (req.body.phone || "").trim();
  if (phone === "") phone = null;
  let address = (req.body.address || "").trim();
  if (address === "") address = null;

  try {
    await updateUnit(
      Number.parseInt(id),
      name,
      phone,
      address
      );
    
    return res.redirect("/admin/polos");
  } catch (err) {
    opts.unit = await getUnit(id);
    opts.message = "Ocorreu um erro: " + err;
    return res.render("admin/alterar-polo/index", opts);
  }
});

fastify.get("/admin/remover-polo/:id", async (req, res) => {
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
    await removeUnit(id);
    return res.redirect("/admin/polos");
  } catch (err) {
    return res.redirect("/admin/polos");
  }

});