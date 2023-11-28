'use strict'

const { JWT_PRIVATE_KEY, JWT_ISS, DOMAIN } = require("../environment");
const { fastify, defOpts } = require("../config");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

fastify.get("/login", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");
  return res.render("login/index", opts);
});

fastify.post("/login", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");

  if (!req.body.email || !req.body.password) {
    opts.message = "Entrada Inválida";
    return res.render("login/index", opts);
  }

  user = await findUserByEmail(req.body.email);

  if (!user) {
    opts.message = "Não existe usuário com este email";
    return res.render("login/index", opts);
  }

  if (await bcrypt.compare(req.body.password.toString(), user.passwordHash.toString())) {
    let token = jwt.sign({
      iss: JWT_ISS,
      sub: user.id
    }, JWT_PRIVATE_KEY, {algorithm: 'HS256'});
  
    res.setCookie("jwt", token, {
      domain: DOMAIN,
      path: "/",
      secure: true,
      httpOnly: true,
      maxAge: 2592000,
      sameSite: "strict"
    });
  
    return res.redirect("/");
    
  } else {
    opts.message = "Senha Incorreta";
    return res.render("login/index", opts);
  }

  
});