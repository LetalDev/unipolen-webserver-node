const { fastify } = require("../config");
const { getUserFromJwt } = require("../models/user");

fastify.get("/logout", async (req, res) => {
  const user = getUserFromJwt(req.cookies.jwt);
  if (user == undefined) {
    return res.redirect("/");
  }

  res.setCookie("jwt", "", {
    maxAge: 0
  });

  res.redirect("/");
});