'use strict'

const fastify = require("fastify")();
const path = require("path");
const { NODE_ENV, PORT, NOREPLY_EMAIL, NOREPLY_PASS } = require("./environment");
const { query, preparedQuery, sequelize } = require("./database");
const handlebars = require("handlebars");
const fs = require("fs");
const { Defaults } = require("./models/defaults");
const minifier = require('html-minifier');
const nodemailer = require("nodemailer");

const mailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: true,
  auth: {
    user: NOREPLY_EMAIL,
    pass: NOREPLY_PASS,
  }
});;

// optionally defined the html-minifier options
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}

async function setup() {
  
  try {
    await mailTransporter.verify();
    console.log("Mail transporter ready");
  } catch (err) {
    console.error("Mail transport failed: " + err);
  }

  fastify.register(require("@fastify/view"), {
    engine: {
      handlebars: handlebars,
    },
    root: path.join(__dirname, "views"), // Points to `./views` relative to the current file
    layout: "./layouts/layout", // Sets the layout to use to `./views/layouts/layout.handlebars` relative to the current file.
    viewExt: "handlebars", // Sets the default extension to `.handlebars`
    propertyName: "render", // The template can now be rendered via `reply.render()` and `fastify.render()`
    defaultContext: {
      dev: NODE_ENV === "development", // Inside your templates, `dev` will be `true` if the expression evaluates to true
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  });
  
  fastify.register(require("@fastify/formbody"))
  
  fastify.register(require("@fastify/cookie"), {
    secret: "my-secret", // for cookies signature
    hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
    parseOptions: {}  // options for parsing cookies
  });
  
  fastify.register(require("@fastify/static"), {
    root: path.join(__dirname, 'public'),
    prefix: '/static/', // optional: default '/'
    constraints: {} // optional: default {}
  });

  await fastify.register(require('@fastify/express'))
  // fastify.use(require('cors')())
  // fastify.use(require('dns-prefetch-control')())
  fastify.use(require('frameguard')())
  fastify.use(require('hsts')())
  fastify.use(require('ienoopen')())
  fastify.use(require('x-xss-protection')())

  fastify.register(require('@fastify/multipart'))

}

function listen() {
  fastify.listen({port: PORT, host: "0.0.0.0"}, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  });
}

async function updateDefOpts() {
  const rows = await Defaults.findAll();
  defOpts.defaults = {};
  for(let row of rows) {
    defOpts.defaults[row.key] = row.value;
  }
}

const defOpts = {
  styles: [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
    "https://fonts.googleapis.com/css?family=Montserrat",
    "/static/css/base.css",
  ],
  scripts: [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js",
  ],
  showHeader: true,
  showFooter: true,
  defaults: {},
}

module.exports = {
  setup,
  fastify,
  defOpts,
  updateDefOpts,
  listen,
  mailTransporter,
};