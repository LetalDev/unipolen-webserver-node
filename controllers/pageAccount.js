const { fastify, defOpts } = require("../fastifyConfig");
const { getUserFromJwt, updateUserEmail, updateUserDisplayName, updateUserPasswordHash } = require("../models/user");
const { renderErrorPage, renderErrorPageRes } = require("./pageError");
const bcrypt = require("bcrypt");

fastify.get("/conta", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return res.status(401).send();
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/conta.css");
  opts.user = user;
  return res.render("conta/index", opts);
});

const FIELD_TO_LABEL = Object.freeze({
  "email": "Digite o novo endereço de email:",
  "nome": "Digite o novo nome:",
  "senha": "Digite a nova senha:",
});

const FIELD_TO_NAME = Object.freeze({
  "email": "email",
  "nome": "nome",
  "senha": "senha",
});

const FIELD_TO_KEY = Object.freeze({
  "email": "email",
  "nome": "display_name",
  "senha": "",
});

const FIELD_TO_INPUT_TYPE = Object.freeze({
  "email": "email",
  "nome": "text",
  "senha": "password",
});

const FIELD_TO_SETTER = Object.freeze({
  "email": updateUserEmail,
  "nome": updateUserDisplayName,
  "senha": updateUserPasswordHash,
});

fastify.get("/conta/alterar/:field", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return res.status(401).send();
  }

  const { field } = req.params;

  if (FIELD_TO_LABEL[field] == undefined) {
    return await renderErrorPageRes(res, 404);
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/conta-alterar.css");
  opts.user = user;
  opts.fieldName = FIELD_TO_NAME[field];
  opts.field = field;
  opts.label = FIELD_TO_LABEL[field];
  opts.currentValue = user[FIELD_TO_KEY[field]];
  opts.inputType = FIELD_TO_INPUT_TYPE[field];
  opts.fieldIsPass = (field == "senha");

  return res.render("conta/alterar/index", opts);
});

fastify.post("/conta/alterar/:field", async (req, res) => {
  const user = await getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return res.status(401).send();
  }

  const { field } = req.params;

  if (FIELD_TO_LABEL[field] == undefined) {
    return await renderErrorPageRes(res, 404);
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/conta-alterar.css");
  opts.user = user;
  opts.fieldName = FIELD_TO_NAME[field];
  opts.field = field;
  opts.label = FIELD_TO_LABEL[field];
  opts.currentValue = user[FIELD_TO_KEY[field]];
  opts.inputType = FIELD_TO_INPUT_TYPE[field];
  opts.fieldIsPass = (field == "senha");

  if (req.body.password == undefined || req.body.newValue == undefined) {
    opts.message = "Entrada Inválida";
    return res.render("conta/alterar/index", opts);
  }

  if (!(await bcrypt.compare(req.body.password, user.password_hash))) {
    opts.message = "Senha Incorreta";
    return res.render("conta/alterar/index", opts);
  }

  if ( !(await FIELD_TO_SETTER[field](user.id, req.body.newValue)) ) {
    opts.message = "Falha ao atualizar " + FIELD_TO_NAME[field];
    return res.render("conta/alterar/index", opts);
  }

  return res.redirect("/conta");

});