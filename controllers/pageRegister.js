const { fastify, defOpts } = require("../fastifyConfig");
const { createUser, getUserFromJwt, getUserFromEmail } = require("../models/user");
const bcrypt = require("bcrypt");

fastify.get("/registrar", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user != undefined) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");
  return res.render("registrar/index", opts);
});

fastify.post("/registrar", async (req, res) => {
  let user = await getUserFromJwt(req.cookies.jwt);
  if (user != undefined) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");

  if (req.body.email == undefined || req.body.password == undefined || req.body.name == undefined) {
    opts.message = "Entrada Inválida";
    return res.render("registrar/index", opts);
  }

  user = await getUserFromEmail(req.body.email);

  if (user != undefined) {
    opts.message = "Já existe um usuário com este email";
    return res.render("registrar/index", opts);
  }

  if (await createUser(req.body.email, req.body.name, await bcrypt.hash(req.body.password, 12))) {
    return res.redirect("/login");
  } else {
    opts.message = "Falha ao registrar, tente novamente mais tarde";
    return res.render("registrar/index", opts)
  }
});