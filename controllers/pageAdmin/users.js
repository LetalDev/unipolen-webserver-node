'use strict'

const { query, sequelize, getFieldsArrayFromModel, getValuesArrayFromRowFields, getFieldsTypeArrayFromModelFields } = require("../../database");
const { fastify, defOpts } = require("../../config");
const { Course } = require("../../models/course");
const { Unit } = require("../../models/unit");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../../models/user");
const { renderErrorPage, renderErrorPageRes } = require("../pageError");
const { Model } = require("sequelize");
const { CustomerUser } = require("../../models/customerUser");
const { Enrollment } = require("../../models/enrollment");




fastify.get("/admin/usuarios", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const users = await User.findAll({
    include: CustomerUser
  });

  const opts = structuredClone(defOpts); opts.showFooter = false;
  opts.styles.push("/static/css/admin.css");
  opts.user = user;



  opts.fields = [
    "id",
    "email",
    "Nome Completo",
    "Nome Social",
    "Conta Ativa?",
    "Cursos com inscrição pendente",
    "Cursos inscritos",
    "Data de Nascimento",
    "País de Residência",
    "Estado de Residência",
    "Cidade de Residência",
    "CEP",
    "Nacionalidade",
    "Naturalidade",
    "Sexo",
    "Possui necessidades especiais?",
    "Telefone",
    "Telefone (Extra)",
    "Permite receber informações?",
    "Como nos Conheceu?",
    "Dúvidas sobre serviço",
    "Criado em",
    "Última atualização em",
  ];

  const fields = getFieldsArrayFromModel(User, { "passwordHash": true });
  opts.rows = [];

  for (const user of users) {
    const customerUser = await user.getCustomerUser();
    const enrollments = (await customerUser?.getEnrollments() || []).map(e => e.dataValues);
    const pendingEnrollments = [];
    const activeEnrollments = [];

    for (const e of enrollments) {
      if (e.status == "em espera") pendingEnrollments.push((await Course.findByPk(e.CourseId)).name);
      else if (e.status == "aceito") activeEnrollments.push((await Course.findByPk(e.CourseId)).name);
    }
    opts.rows.push({
      id: user.id,
      isActive: user.isActive,
      values: [
        user.id,
        user.email,
        customerUser?.fullLegalName,
        customerUser?.displayName,
        user.isActive,
        pendingEnrollments,
        activeEnrollments,
        customerUser?.birthDate,
        customerUser?.country,
        customerUser?.state,
        customerUser?.city,
        customerUser?.postalCode,
        customerUser?.nationality,
        customerUser?.naturality,
        customerUser?.legalGender,
        customerUser?.specialNeeds,
        customerUser?.phone,
        customerUser?.phoneExtra,
        customerUser?.allowNewsletter,
        customerUser?.getToKnowCompanyDesc,
        customerUser?.doubtsAboutService,
        user.createdAt,
        new Date(Math.min(user.updatedAt, customerUser?.updatedAt || user.updatedAt)),
      ],
    });
  }

  return res.render("/admin/usuarios", opts);
});


fastify.get("/admin/trocar-ativacao-usuario/:id", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }
  if (!(await isUserAdmin(user))) {
    return await renderErrorPageRes(res, 403);
  }

  const { id } = req.params;

  const subject = await User.findByPk(id);

  await subject.update({
    isActive: !subject.isActive,
  });

  return res.redirect("/admin/usuarios");
})