'use strict'

const { fastify, defOpts } = require("../config");
const { PASS_SALTS } = require("../environment");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../models/user");
const bcrypt = require("bcrypt");

fastify.get("/registrar", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");
  return res.render("registrar/index", opts);
});

fastify.post("/registrar", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");

  if (!req.body.email || !req.body.password || !req.body.name) {
    opts.message = "Entrada Inválida";
    return res.render("registrar/index", opts);
  }

  user = await findUserByEmail(req.body.email);

  if (user) {
    opts.message = "Já existe um usuário com este email";
    return res.render("registrar/index", opts);
  }

  if (await User.create({
    email: req.body.email,
    displayName: req.body.name,
    passwordHash: await bcrypt.hash(req.body.password, PASS_SALTS),
  })) {
    return res.redirect("/login");
  } else {
    opts.message = "Falha ao registrar, tente novamente mais tarde";
    return res.render("registrar/index", opts)
  }
});