'use strict'

const { fastify, defOpts, mailTransporter } = require("../config")
const { User, findUserByJwt, findUserByEmail } = require("../models/user")
const { object, string } = require("yup");
const randomstring = require("randomstring");
const { NOREPLY_EMAIL, NODE_ENV, DOMAIN, PORT, PASS_SALTS } = require("../environment");
const { renderErrorPageRes } = require("./pageError");
const { parse } = require("handlebars");
const bcrypt = require("bcrypt");

const resetPassFormSchema = object({
  email: string().required("Email não pode estar em branco")
    .email("O email é inválido").trim(),
});

const step2ResetPassFormSchema = object({
  password: string().required("A senha não pode estar vazia").trim(),
  passwordConfirm: string().required("A confiramção de senha não pode estar vazia").trim(),
})

const resetPassRegistry = {};

fastify.get("/resetar-senha", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);

  return res.render("/resetar-senha/index", opts);
});

fastify.post("/resetar-senha", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);

  try {
    const parsed = resetPassFormSchema.cast(req.body);
    
    user = await findUserByEmail(parsed.email);

    if (!user) {
      opts.message = "Não existe usuário com este email";
      return res.render("/resetar-senha/index", opts);
    }

    const token = randomstring.generate({
      charset: "alphanumeric",
      length: 32,
    });

    resetPassRegistry[token] = {
      userId: user.id,
    };

    setTimeout(() => {
      if (resetPassRegistry[token])
        resetPassRegistry[token] = undefined;
    }, 1000*60*30); //30 minutes

    await mailTransporter.sendMail({
      from: NOREPLY_EMAIL,
      to: parsed.email,
      subject: "Troca de Senha em Unipolen",
      text: "Houve uma tentativa de troca de senha na sua conta em Unipolen, " +
      "segue o link para trocar a senha de sua conta: " +
      `${NODE_ENV == "development" ? "http" : "https"}://${DOMAIN}:${PORT}/resetar-senha/${token}`+
      "\n\nEste código é válido por 30 minutos",
    });

    return res.render("/resetar-senha/sent", opts);
    
  } catch (err) {
    opts.message = err;
    return res.render("/resetar-senha/index", opts);
  }
});


fastify.get("/resetar-senha/:token", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const { token } = req.params;

  const opts = structuredClone(defOpts); 
  opts.token = token;
  
  if (!resetPassRegistry[token]) {
    opts.message = "O link expirou.";
    return res.render("/resetar-senha/index", opts);
  }
 
  return res.render("/resetar-senha/passo2", opts);
});

fastify.post("/resetar-senha/:token", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const { token } = req.params;

  const opts = structuredClone(defOpts); 
  opts.token = token;
  
  if (!resetPassRegistry[token]) {
    opts.message = "O link expirou.";
    return res.render("/resetar-senha/index", opts);
  }

  try {
    const parsed = step2ResetPassFormSchema.cast(req.body);

    if (parsed.password != parsed.passwordConfirm) {
      opts.message = "As senhas diferem."
      return res.render("/resetar-senha/passo2", opts);
    }

    user = await User.findByPk(resetPassRegistry[token].userId);

    console.log(resetPassRegistry[token]);
    console.log(user);

    if (!user) {
      opts.message = "Este usuário não existe."
      return res.render("/resetar-senha/passo2", opts);
    }

    await user.update({
      passwordHash: await bcrypt.hash(parsed.password, PASS_SALTS),
    });

    resetPassRegistry[token] = undefined;

    return res.render("/resetar-senha/sucesso", opts);
  } catch (err) {
    opts.message = err;
    return res.render("/resetar-senha/passo2", opts);
  }
});