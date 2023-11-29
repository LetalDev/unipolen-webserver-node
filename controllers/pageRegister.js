'use strict'

const { fastify, defOpts, mailTransporter } = require("../config");
const { PASS_SALTS, NOREPLY_EMAIL, NODE_ENV, DOMAIN } = require("../environment");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../models/user");
const bcrypt = require("bcrypt");
const { object, string, boolean, date } = require("yup");
const randomstring = require("randomstring");
const { phone } = require("phone");


const stage1FormSchema = object({
  fullLegalName: string().required("Insira seu nome completo").trim(),
  displayName: string().nullable().trim().default(null),
  email: string().required("Insira seu email").trim().email("Email inválido"),
  phone: string().required("Insira seu telefone")
    .typeError("o telefone inserido é inválido").trim()
    .transform(val => phone(val).phoneNumber),
});

const stage2FormSchema = object({
  legalGender: string().required("Insira seu sexo (como consta no RG/CPF)")
    .oneOf(["male", "female"]),
  phoneExtra: string().nullable().trim().default(null),
  nationality: string().required("Insira sua nacionalidade").trim(),
  naturality: string().required("Insira sua naturalidade").trim(),
  birthDate: string().required("Insira sua data de nascimento")
    .min(new Date(1900, 0, 1), "Data de nascimento inválida")
    .max(Date.now(), "Data de nascimento inválida"),
  cpf: string().required("Insira seu CPF").trim(),
  rg: string().required("Insira seu RG").trim(),
  country: string().required("Insira seu país de residência").trim(),
  state: string().required("Insira seu estado de residência").trim(),
  city: string().required("Insira sua cidade de residência").trim(),
  allowNewsletter: boolean().required().transform(val => val === "on" ? true : false).default(false),
  getToKnowCompanyDesc: string().required().trim().default(""),
  specialNeeds: boolean().required().transform(val => val === "on" ? true : false).default(false),
});

const intermediateRegistry = {}

fastify.get("/registrar", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");
  return res.render("registrar/passo1", opts);
});

fastify.post("/registrar", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");

  try {
    const parsed = stage1FormSchema.cast(req.body);

    const registerToken = randomstring.generate({
      charset: 'alphanumeric',
      length: 64,
    });

    const link = (NODE_ENV=="development"?"http":"https") + `://${DOMAIN}/registrar/2/${registerToken}`

    await mailTransporter.sendMail({
      from: NOREPLY_EMAIL,
      to: parsed.email,
      subject: "Cadastro em Unipolen",
      text: `Utilize este link para continuar a criação de sua conta na Unipolen:\n\n${link}\n\nEste link expira em 24 horas.`,
      html: `
        <h1>Cadastro em Unipolen</h1>
        <p>Utilize este link para continuar a criação de sua conta na Unipolen:</p>
        <a href="${link}">${link}</a><br><br>
        Este link expira em 24 horas
      `
    });

    intermediateRegistry[registerToken] = parsed;

    console.log(intermediateRegistry[registerToken]);

    setTimeout(() => {
      if (intermediateRegistry[registerToken]) intermediateRegistry[registerToken] = undefined;
    }, 1000*60*60*24); //1 day

    return res.render("registrar/passo1Sucesso", opts);
  } catch (err) {
    opts.message = err;
    return res.render("/registrar/passo1", opts)
  }
});


fastify.get("/registrar/2/:token", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");

  const { token } = req.params;

  if (!intermediateRegistry[token]) {
    return res.render("/registrar/passo2Erro", opts);
  }

  opts.token = token;

  return res.render("registrar/passo2", opts);
});


fastify.post("/registrar/2/:token", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const { token } = req.params;

  if (!intermediateRegistry[token]) {
    return res.render("/registrar/passo2Erro", opts);
  }

  try {
    const parsed = stage2FormSchema.cast(req.body);

    for (const field in parsed) {
      intermediateRegistry[token][field] = parsed[field];
    }

    console.log(intermediateRegistry[token]);

    return res.redirect(`/registrar/3/${token}`);

  } catch (err) {
    const opts = structuredClone(defOpts);
    opts.styles.push("/static/css/login.css");
    opts.message = err;
    return res.render("/registrar/passo2", opts);
  }
  
});

fastify.get("/registrar/3/:token", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");

  const { token } = req.params;

  if (!intermediateRegistry[token]) {
    return res.render("/registrar/passo2Erro", opts);
  }

  opts.token = token;

  return res.render("registrar/passo3", opts);
});