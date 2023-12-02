'use strict'

const { fastify, defOpts, mailTransporter } = require("../config");
const { PASS_SALTS, NOREPLY_EMAIL, NODE_ENV, DOMAIN, PORT } = require("../environment");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../models/user");
const bcrypt = require("bcrypt");
const { object, string, boolean, date } = require("yup");
const randomstring = require("randomstring");
const { phone } = require("phone");
const { Op } = require("sequelize");
const { CustomerUser } = require("../models/customerUser");


const stage1FormSchema = object({
  fullLegalName: string().required("Insira seu nome completo").trim(),
  displayName: string().nullable().trim().default(null),
  email: string().required("Insira seu email").trim().email("Email inválido"),
  phone: string().required("por favor insira um telefone")
    .transform(val => {
      val = val.trim();
      const phoneNumber = phone(val).phoneNumber;
      if (!phoneNumber) throw "O telefone inserido é inválido";
      return phoneNumber;
    }),

});

const stage2FormSchema = object({
  legalGender: string().required("Insira seu sexo (como consta no RG/CPF)")
    .oneOf(["male", "female"]),
  phoneExtra: string().nullable().transform(val => {
      val = val.trim();
      const phoneNumber = phone(val).phoneNumber;
      if (!phoneNumber && val != "") throw "O telefone inserido é inválido";
      return phoneNumber;
    }),
  nationality: string().required("Insira sua nacionalidade").trim(),
  naturality: string().required("Insira sua naturalidade").trim(),
  birthDate: string().required("Insira sua data de nascimento")
    .min(new Date(1900, 0, 1), "Data de nascimento inválida")
    .max(Date.now(), "Data de nascimento inválida"),
  cpf: string().required("Insira seu CPF").trim()
    .transform(val => val.replace(".", "")),
  rg: string().required("Insira seu RG").trim()
    .transform(val => val.replace(".", "")),
  country: string().required("Insira seu país de residência").trim(),
  state: string().required("Insira seu estado de residência").trim(),
  city: string().required("Insira sua cidade de residência").trim(),
  postalCode: string().required("Insira o seu CEP").trim()
    .transform(val => val.replace("-", "")),
  allowNewsletter: boolean().required().transform(val => val === "on" ? true : false).default(false),
  getToKnowCompanyDesc: string().required().trim().default(""),
  specialNeeds: boolean().required().transform(val => val === "on" ? true : false).default(false),
});

const stage3FormSchema = object({
  password: string().required("Por favor insira a sua senha"),
  passwordConfirm: string().required("Por favor, insira sua confirmação de senha"),
});

const intermediateRegistry = {}

fastify.get("/registrar", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");
  opts.styles.push("https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css");
  return res.render("registrar/passo1", opts);
});

fastify.post("/registrar", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");
  opts.styles.push("https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css");

  try {
    const parsed = stage1FormSchema.cast(req.body);

    if (await findUserByEmail(parsed.email)) {
      opts.message = "Já existe um usuário com este email.";
      return res.render("/registrar/passo1", opts);
    }

    if (await CustomerUser.findOne(
      {
        where: {
          [Op.or]: {
            phone: parsed.phone,
            phoneExtra: parsed.phone,
          }
        }
    })) {
      opts.message = "Já existe um usuário com este número de telefone."
      return res.render("/registrar/passo1", opts);
    }

    const registerToken = randomstring.generate({
      charset: 'alphanumeric',
      length: 64,
    });

    const link = `${NODE_ENV == "development" ? "http" : "https"}` +
      `://${DOMAIN}:${NODE_ENV == "development" ? PORT : ""}` +
      `/registrar/2/${registerToken}`;

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

    setTimeout(() => {
      if (intermediateRegistry[registerToken]) intermediateRegistry[registerToken] = undefined;
    }, 1000 * 60 * 60 * 24); //1 day

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
  opts.styles.push("https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css");

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

    if (parsed.phoneExtra != "" && await CustomerUser.findOne(
      {
        where: {
          [Op.or]: {
            phone: parsed.phoneExtra,
            phoneExtra: parsed.phoneExtra,
          }
        }
    })) {
      const opts = structuredClone(defOpts);
      opts.styles.push("/static/css/login.css");
      opts.styles.push("https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css");
      opts.message = "Já existe um usuário com este número de telefone."
      opts.token = token;
      return res.render("/registrar/passo2", opts);
    }

    return res.redirect(`/registrar/3/${token}`);

  } catch (err) {
    const opts = structuredClone(defOpts);
    opts.styles.push("/static/css/login.css");
    opts.styles.push("https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css");
    opts.message = err;
    opts.token = token;
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


fastify.post("/registrar/3/:token", async (req, res) => {
  let user = await findUserByJwt(req.cookies.jwt);
  if (user) {
    return res.redirect("/");
  }

  const { token } = req.params;

  if (!intermediateRegistry[token]) {
    return res.render("/registrar/passo2Erro", opts);
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/login.css");
  opts.token = token;

  try {
    const parsed = stage3FormSchema.cast(req.body);

    if (parsed.password != parsed.passwordConfirm) {
      opts.message = "As senhas diferem.";
      return res.render("/registrar/passo3", opts);
    }

    intermediateRegistry[token]["passwordHash"] = await bcrypt.hash(parsed.password, PASS_SALTS);

    
    const user = await User.create(intermediateRegistry[token]);
    try {
      await user.createCustomerUser(intermediateRegistry[token]);
    } catch (err) {
      await user.destroy();
      intermediateRegistry[token] = undefined;
      opts.message = "Ocorreu um erro, tente novamente mais tarde";
      return res.render("/registra/passo3", opts);
    }

    intermediateRegistry[token] = undefined;

    return res.render("/registrar/passo3Sucesso", opts);
  } catch (err) {
    opts.message = err;
    return res.render("/registrar/passo3", opts);
  }
});