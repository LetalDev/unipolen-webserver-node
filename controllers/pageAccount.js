'use strict'

const { default: phone } = require("phone");
const { fastify, defOpts, mailTransporter } = require("../config");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../models/user");
const { renderErrorPage, renderErrorPageRes } = require("./pageError");
const bcrypt = require("bcrypt");
const { object, boolean, string } = require("yup");
const { NOREPLY_EMAIL, PASS_SALTS } = require("../environment");
const randomstring = require("randomstring");


const updateInfoFormSchemaUser = object({
  email: string().required("Email não pode estar em branco").email("Email inválido").trim(),
});

const updateInfoFormSchemaCustomer = object({
  displayName: string().nullable().trim(),
  country: string().required("País de residência não pode estar em branco").trim(),
  state: string().required("Estado de residência não pode estar em branco").trim(),
  city: string().required("Cidade de residência não pode estar em branco").trim(),
  postalCode: string().required("CEP não pode estar em branco").trim(),
  specialNeeds: boolean().required().default(false).transform(val => val === "on" ? true : false),
  allowNewsletter: boolean().required().default(false).transform(val => val === "on" ? true : false),
  phone: string().required("Telefone principal não pode estar em branco").trim()
    .typeError("O telefone inserido é inváldi")
    .transform(val => phone(val).phoneNumber),
  phoneExtra: string().nullable().trim().default(null),
});

const updatePasswordFormSchema = object({
  password: string().required("Por favor insira a senha").trim(),
  passwordConfirm: string().required("Por favor confirme a senha").trim(),
});

const infoAuthCodeRegistry = {};
const passAuthCodeRegistry = {};

fastify.get("/conta", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return renderErrorPageRes(res, 401);
  }

  const customerUser = await user.getCustomerUser();

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/conta.css");
  opts.user = {
    ...user.dataValues,
    customer: customerUser?.dataValues
  };
  if (customerUser) {
    let birthDate = opts.user.customer.birthDate;
    let day = ("0" + birthDate.getDate()).slice(-2);
    let month = ("0" + (birthDate.getMonth() + 1)).slice(-2);
    opts.user.customer.birthDate = `${birthDate.getFullYear()}-${month}-${day}`;
    opts.user.customer.legalGender = opts.user.legalGender == "male" ? "masculino" : "feminino";
  }

  opts.admin = await isUserAdmin(user);
  return res.render("conta/index", opts);
});


fastify.post("/conta/atualizar-dados", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return renderErrorPageRes(res, 401);
  }

  const opts = structuredClone(defOpts);
  opts.user = user;

  const customerUser = await user.getCustomerUser();

  try {
    const parsedUser = updateInfoFormSchemaUser.cast(req.body);
    let parsedCustomer = undefined;
    if (customerUser) {
      parsedCustomer = updateInfoFormSchemaCustomer.cast(req.body);
    }

    const authCode = randomstring.generate({
      charset: "numeric",
      length: 8,
    });

    const text = "Houve uma tentativa de alteração no cadastro da sua conta na Unipolen, "+
      "portanto estamos enviando este código para a confirmação deste ato:\n"+
      +authCode+"\n\nEste código é válido por 30 minutos";

    await mailTransporter.sendMail({
      from: NOREPLY_EMAIL,
      to: parsedUser.email,
      subject: "Alteração no Cadastro em Unipolen",
      text: text, 
    });

    infoAuthCodeRegistry[user.id] = {
      user: parsedUser,
      customer: parsedCustomer,
      authCode: authCode,
    };
    setTimeout(() => {
      if (infoAuthCodeRegistry[user.id])
        infoAuthCodeRegistry[user.id] = undefined;
    }, 1000*60*30); //30 minutes

    opts.email = user.email;
    return res.render("/conta/alterar", opts);
  } catch (err) {
    opts.message = err;
    return res.render("/conta/index", opts);
  }
});


fastify.post("/conta/atualizar-dados-confirmar", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return renderErrorPageRes(res, 401);
  }

  const opts = structuredClone(defOpts);
  opts.email = user.email;
  opts.user = user;

  const customerUser = await user.getCustomerUser();

  const { authCode } = req.body;

  if (infoAuthCodeRegistry[user.id].authCode != authCode) {
    opts.message = "O código inserido é inválido"
    return res.render("/conta/alterar", opts) 
  }

  await user.update(infoAuthCodeRegistry[user.id].user);
  await customerUser.update(infoAuthCodeRegistry[user.id].customer);

  infoAuthCodeRegistry[user.id] = undefined;

  return res.redirect("/conta");
});


fastify.get("/conta/alterar-senha", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return renderErrorPageRes(res, 401);
  }

  const opts = structuredClone(defOpts);
  opts.email = user.email;
  opts.user = user;

  return res.render("/conta/alterarSenha", opts);
});

fastify.post("/conta/alterar-senha", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return renderErrorPageRes(res, 401);
  }

  const opts = structuredClone(defOpts);
  opts.email = user.email;
  opts.user = user;

  try {
    const parsed = updatePasswordFormSchema.cast(req.body);

    if (parsed.password != parsed.passwordConfirm) {
      opts.message = "Senhas diferem.";
      return res.render("/conta/alterarSenha", opts);
    }

    const passwordHash = await bcrypt.hash(parsed.password, PASS_SALTS);
    const authCode = randomstring.generate({
      charset: "numeric",
      length: 8,
    });

    passAuthCodeRegistry[user.id] = {
      passwordHash: passwordHash,
      authCode: authCode,
    }

    setTimeout(() => {
      if (passAuthCodeRegistry[user.id])
        passAuthCodeRegistry[user.id] = undefined;
    }, 1000*60*30); //30 minutes

    mailTransporter.sendMail({
      from: NOREPLY_EMAIL,
      to: user.email,
      subject: "Alterar Senha em Unipolen",
      text: "Houve uma tentativa de alteração de senha no seu cadastro em Unipolen, "+
        `este é o código de confirmação: ${authCode}\n\nO código é válido por 30 minutos`,
    });

    return res.render("/conta/alterarSenhaConfirm", opts);

  } catch (err) {
    opts.message = err;
    return res.render("/conta/alterarSenha", opts);
  }
});

fastify.post("/conta/alterar-senha-confirm", async (req, res) => {
  const user = await findUserByJwt(req.cookies.jwt);
  if (!user) {
    return renderErrorPageRes(res, 401);
  }

  const opts = structuredClone(defOpts);
  opts.email = user.email;
  opts.user = user;

  const { authCode } = req.body;

  if (passAuthCodeRegistry[user.id].authCode != authCode) {
    opts.message = "O código inserido é inválido";
    return res.render("/conta/alterarSenhaConfirm", opts);
  }

  await user.update({
    passwordHash: passAuthCodeRegistry[user.id].passwordHash,
  });

  return res.render("/conta/alterarSenhaSuccess", opts);
});