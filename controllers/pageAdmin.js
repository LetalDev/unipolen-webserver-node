'use strict'

const { query, sequelize } = require("../database");
const { fastify, defOpts } = require("../config");
const { Course } = require("../models/course");
const { Unit } = require("../models/unit");
const { User } = require("../models/user");
const { renderErrorPage, renderErrorPageRes } = require("./pageError");
 

fastify.get("/admin", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  return res.render("/admin/index", opts);
});

fastify.get("/admin/componentes", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  return res.render("/admin/componentes", opts);
});

fastify.get("/admin/cursos", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const courses = await Course.findAll({order: [["updatedAt", "DESC"]]});

  const opts = {
    styles: ["/static/css/admin.css"],
    courses: courses.map(course => course.dataValues),
  };

  return res.render("/admin/cursos", opts);
});

fastify.get("/admin/polos", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const units = await Unit.findAll({order: [["updatedAt", "DESC"]]});

  const opts = {
    styles: ["/static/css/admin.css"],
    units: units.map(unit => unit.dataValues),
  };

  return res.render("/admin/polos", opts);
});

fastify.get("/admin/usuarios", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const users = await User.findAll();

  const opts = {
    styles: ["/static/css/admin.css"],
    users: users.map(user => user.dataValues),
  };

  return res.render("/admin/usuarios", opts);
});

fastify.get("/admin/sql", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }
  const opts = {
    styles: ["/static/css/admin.css"],
  };

  return res.render("/admin/sql", opts);
});

fastify.post("/admin/query", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return res.status(401).send();
  }
  if (!(await User.isAdmin(user))) {
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


fastify.get("/admin/adicionar-curso", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  return res.render("admin/adicionar-curso/index", opts);

});

fastify.post("/admin/adicionar-curso", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  let name = (req.body.name || "").trim();
  if (name === "") name = null;
  let durationMonths = Number.parseInt(req.body.durationMonths) || null;
  let hours = Number.parseInt(req.body.hours) || null;
  let isAvailable = req.body.isAvailable || false;
  let degree = (req.body.degree || "").trim();
  if (degree === "") degree = null;
  let qualification = (req.body.qualification || "").trim();
  if (qualification === "") qualification = null;
  let style = (req.body.style || "").trim();
  if (style === "") style = null;
  let isHighlighted = req.body.isHighlighted || false;
  let url = (req.body.url || "").trim();
  if (url === "") url = null;

  try {
    await Course.create({
      name: name,
      durationMonths: durationMonths,
      hours: hours,
      isAvailable: isAvailable,
      degree: degree,
      qualification: qualification,
      style: style,
      isHighlighted: isHighlighted,
      url: url,
    });

    return res.redirect("/admin/cursos");
  } catch (err) {
    opts.message = "Ocorreu um erro: " + err;
    return res.render("/admin/adicionar-curso/index", opts);
  }
});

fastify.get("/admin/remover-curso/:id", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {
    styles: ["/static/css/admin.css"],
  };

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
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const course = await Course.findByPk(id);
  
  const opts = {
    styles: ["/static/css/admin.css"],
    course: course.dataValues,
  };

  return res.render("admin/alterar-curso/index", opts);
});

fastify.post("/admin/alterar-curso/:id", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  let name = (req.body.name || "").trim();
  if (name === "") name = null;
  let durationMonths = Number.parseInt(req.body.durationMonths) || null;
  let hours = Number.parseInt(req.body.hours) || null;
  let isAvailable = req.body.isAvailable || false;
  let degree = (req.body.degree || "").trim();
  if (degree === "") degree = null;
  let qualification = (req.body.qualification || "").trim();
  if (qualification === "") qualification = null;
  let style = (req.body.style || "").trim();
  if (style === "") style = null;
  let isHighlighted = req.body.isHighlighted || false;
  let url = (req.body.url || "").trim();
  if (url === "") url = null;

  const course = await Course.findByPk(id);

  try {
    await course.update({
      name: name,
      durationMonths: durationMonths,
      hours: hours,
      isAvailable: isAvailable,
      degree: degree,
      qualification: qualification,
      style: style,
      isHighlighted: isHighlighted,
      url: url,
    });
    
    return res.redirect("/admin/cursos");
  } catch (err) {
    opts.course = course.dataValues;
    opts.message = "Ocorreu um erro: " + err;
    return res.render("admin/alterar-curso/index", opts);
  }
});

fastify.get("/admin/adicionar-polo", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  return res.render("admin/adicionar-polo/index", opts);

});

fastify.post("/admin/adicionar-polo", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
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
    const queryResult = await Unit.create({
      name: name,
      phone: phone,
      address: address,
    });

    return res.redirect("/admin/polos");
  } catch (err) {
    opts.message = "Ocorreu um erro: " + err;
    return res.render("/admin/adicionar-polo/index", opts);
  }
});

fastify.get("/admin/alterar-polo/:id", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const unit = await Unit.findByPk(id);
  
  const opts = {
    styles: ["/static/css/admin.css"],
    unit: unit.dataValues,
  };

  return res.render("admin/alterar-polo/index", opts);
});

fastify.post("/admin/alterar-polo/:id", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
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

  const unit = await Unit.findByPk(id);

  try {
    await unit.update({
      name: name,
      phone: phone,
      address: address
      });
    
    return res.redirect("/admin/polos");
  } catch (err) {
    opts.unit = unit.dataValues;
    opts.message = "Ocorreu um erro: " + err;
    return res.render("admin/alterar-polo/index", opts);
  }
});

fastify.get("/admin/remover-polo/:id", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await User.isAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const opts = {
    styles: ["/static/css/admin.css"],
  };

  const { id } = req.params;

  try {
    const unit = await Unit.findByPk(id);
    await unit.destroy();
    return res.redirect("/admin/polos");
  } catch (err) {
    return res.redirect("/admin/polos");
  }

});