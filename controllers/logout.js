const { fastify } = require("../config");
const { User } = require("../models/user");

fastify.get("/logout", async (req, res) => {
  const user = User.findByJwt(req.cookies.jwt);
  if (user == undefined) {
    return res.redirect("/");
  }

  res.setCookie("jwt", "", {
    maxAge: 0
  });

  res.redirect("/");
});