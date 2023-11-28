const { fastify, defOpts } = require("../config");
const { User } = require("../models/user");
const { renderErrorPage, renderErrorPageRes } = require("./pageError");
const bcrypt = require("bcrypt");

fastify.get("/conta", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/conta.css");
  opts.user = user.dataValues;
  opts.admin = await User.isAdmin(user);
  return res.render("conta/index", opts);
});

const FIELD_TO_PROPS = Object.freeze({
  "email": {
    LABEL: "Digite o novo endereço de email:",
    NAME: "email",
    GETTER: "email",
    SETTER: "email",
    INPUT_TYPE: "email",
  },
  "nome": {
    LABEL: "Digite o novo nome:",
    NAME: "nome",
    GETTER: "displayName",
    SETTER: "displayName",
    INPUT_TYPE: "text",
  },
  "senha": {
    LABEL: "Digite a nova senha:",
    NAME: "senha",
    GETTER: "",
    SETTER: "passwordHash",
    INPUT_TYPE: "password",
  },
});

fastify.get("/conta/alterar/:field", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }

  const { field } = req.params;

  const props = FIELD_TO_PROPS[field];

  if (!props) {
    return await renderErrorPageRes(res, 404);
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/conta-alterar.css");
  opts.user = user.dataValues;
  opts.admin = await User.isAdmin(user);
  opts.fieldName = props.NAME;
  opts.field = field;
  opts.label = props.LABEL;
  opts.currentValue = user[props.GETTER];
  opts.inputType = props.INPUT_TYPE;
  opts.fieldIsPass = (field == "senha");

  return res.render("conta/alterar/index", opts);
});

fastify.post("/conta/alterar/:field", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 401);
  }

  const { field } = req.params;

  const props = FIELD_TO_PROPS[field];

  if (!props) {
    return await renderErrorPageRes(res, 404);
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/conta-alterar.css");
  opts.user = user.dataValues;
  opts.admin = await User.isAdmin(user);
  opts.fieldName = props.NAME;
  opts.field = field;
  opts.label = props.LABEL;
  opts.currentValue = user[props.GETTER];
  opts.inputType = props.INPUT_TYPE;
  opts.fieldIsPass = (field == "senha");

  if (!req.body.password || !req.body.newValue) {
    opts.message = "Entrada Inválida";
    return res.render("conta/alterar/index", opts);
  }

  if (!(await bcrypt.compare(req.body.password, user.passwordHash))) {
    opts.message = "Senha Incorreta";
    return res.render("conta/alterar/index", opts);
  }

  let newValue = req.body.newValue;

  if (field == "senha") {
    newValue = await bcrypt.hash(newValue, 12);
  }

  const updateObj = {};
  updateObj[props.SETTER] = newValue;

  if ( !(await user.update(updateObj)) ) {
    opts.message = "Falha ao atualizar " + FIELD_TO_NAME[field];
    return res.render("conta/alterar/index", opts);
  }

  return res.redirect("/conta");

});

fastify.get("/conta/apagar", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 404);
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/conta-alterar.css");
  opts.user = user.dataValues;

  return res.render("/conta/apagar/index", opts);
});

fastify.post("/conta/apagar", async (req, res) => {
  const user = await User.findByJwt(req.cookies.jwt);
  if (!user) {
    return await renderErrorPageRes(res, 404);
  }

  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/conta-alterar.css");
  opts.user = user.dataValues;

  if (!(await bcrypt.compare(req.body.password, user.password))) {
    opts.message = "Senha Incorreta";
    return res.render("/conta/apagar/index", opts)
  }

  await user.destroy();

  return res.redirect("/logout");
});