'use strict'

const { fastify, defOpts } = require("../config")
const Fastify = require("fastify");

const ERROR_MESSAGE = Object.freeze({
  "400": "Requisição inválida. Verifique os parâmetros.",
  "401": "Não autorizado. Faça login para acessar este recurso.",
  "403": "Acesso proibido. Você não tem permissão para acessar este recurso.",
  "404": "Recurso não encontrado.",
  "500": "Erro interno do servidor. Tente novamente mais tarde.",
  "503": "Serviço indisponível. Tente novamente mais tarde."
});

async function renderErrorPage(errorCode) {
  if (typeof errorCode != "number") console.log("errorCode is not a number");
  const opts = structuredClone(defOpts);
  opts.showHeader = false;
  opts.showFooter = false;
  opts.styles = [];
  opts.error = errorCode;
  opts.message = ERROR_MESSAGE[errorCode] || "";
  return await fastify.render("error", opts);
}

async function renderErrorPageRes(res, errorCode) {
  if (typeof errorCode != "number") console.log("errorCode is not a number");
  const opts = structuredClone(defOpts);
  opts.showHeader = false;
  opts.showFooter = false;
  opts.styles = [];
  opts.error = errorCode;
  opts.message = ERROR_MESSAGE[errorCode] || "";
  return res.status(errorCode)
    .headers({"Content-Type": "text/html"})
    .send(await fastify.render("error", opts));
}

fastify.setErrorHandler(async function (error, req, res) {
  if (error instanceof Fastify.errorCodes.FST_ERR_NOT_FOUND) {
    return await renderErrorPageRes(res, 404);
  } else {
    console.log(error);
    return await renderErrorPageRes(res, 500);
  }
});

module.exports = {
  renderErrorPage,
  renderErrorPageRes,
}