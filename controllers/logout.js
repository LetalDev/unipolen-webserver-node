'use strict'

const { fastify } = require("../config");
const { DOMAIN } = require("../environment");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../models/user");

fastify.get("/logout", async (req, res) => {
  res.setCookie("jwt", "", {
    domain: DOMAIN,
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 0,
    sameSite: "strict"
  });

  res.redirect("/");
});