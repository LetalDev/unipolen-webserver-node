const { JWT_PRIVATE_KEY, JWT_ISS, DOMAIN } = require("../environment");
const { fastify, defOpts } = require("../config");
const { getUserFromJwt, getUserFromEmail } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

fastify.get("/login", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user != undefined) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");
  return res.render("login/index", opts);
});

fastify.post("/login", async (req, res) => {
  let user = await getUserFromJwt(req.cookies.jwt);
  if (user != undefined) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");

  if (req.body.email == undefined || req.body.password == undefined) {
    opts.message = "Entrada Inválida";
    return res.render("login/index", opts);
  }

  user = await getUserFromEmail(req.body.email);

  if (user == undefined) {
    opts.message = "Não existe usuário com este email";
    return res.render("login/index", opts);
  }

  if (await bcrypt.compare(req.body.password.toString(), user.password_hash.toString())) {
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