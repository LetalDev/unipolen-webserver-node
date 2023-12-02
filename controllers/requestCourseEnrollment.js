'use strict'

const { Op } = require("sequelize");
const { fastify, defOpts, mailTransporter } = require("../config");
const { NOREPLY_EMAIL, ADMIN_EMAIL, NODE_ENV, DOMAIN, PORT } = require("../environment");
const { Course } = require("../models/course");
const { EnrollmentRequest, Enrollment } = require("../models/enrollment");
const { findUserByJwt } = require("../models/user")


fastify.get("/curso-inscrever/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return res.redirect("/login");
  }

  const { id } = req.params;

  const opts = structuredClone(defOpts);
  const course = await Course.findByPk(id);

  if (!course.isAvailable) {
    return res.redirect("/cursos");
  }

  opts.course = course.dataValues;
  opts.user = user;

  return res.render("/curso-inscrever/index", opts);
});

fastify.post("/curso-inscrever/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return res.redirect("/login");
  }

  const { id } = req.params;
  const opts = structuredClone(defOpts);
  opts.user = user;

  const course = await Course.findByPk(id);
  const customerUser = await user.getCustomerUser();

  if (await Enrollment.findOne({
    where: {
      [Op.and]: {
        CustomerUserId: customerUser.id,
        CourseId: course.id,
      }
    }
  })) {
    opts.message = "Você já se inscreveu neste curso.";
    opts.course = course.dataValues;
    return res.render("/curso-inscrever/index", opts);
  }

  await Enrollment.create({
    status: "em espera",
    CourseId: course.id,
    CustomerUserId: customerUser.id
  });

  await mailTransporter.sendMail({
    from: NOREPLY_EMAIL,
    to: ADMIN_EMAIL,
    subject: "Novo Pedido de Inscrição em Unipolen",
    html: "<h3>Houve um novo pedido de inscrição para um curso em Unipolen</h3>"+
    `<a href="${NODE_ENV == "development" ? "http" : "https"}://${DOMAIN}:${PORT}/admin/pedidos-matriculas">Ir para Console</a>`+
    `<br><br><pre>Usuário: ${JSON.stringify({...user.dataValues, perfilCliente: customerUser.dataValues}, null, 2)}\n\n\nCurso: ${JSON.stringify(course.dataValues, null, 2)}</pre>`,
  });

 

  return res.render("/curso-inscrever/success", opts);
});