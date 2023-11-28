const { fastify } = require("../config");
const { DOMAIN } = require("../environment");
const { User } = require("../models/user");

fastify.get("/logout", async (req, res) => {
  const user = User.findByJwt(req.cookies.jwt);
  if (user == undefined) {
    return res.redirect("/");
  }

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