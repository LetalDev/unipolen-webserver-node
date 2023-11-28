'use strict'

const { fastify, defOpts } = require("../config");
const { Course } = require("../models/course");
const { User, findUserByJwt, findUserByEmail, isUserAdmin } = require("../models/user");

fastify.get("/cursos/:page", async (req, res) => {
  const opts = structuredClone(defOpts);
  opts.pageCnt = Math.floor(await Course.count({where: {isAvailable: true}}) / 15) + 1;

  let { page } = req.params;
  page = Number.parseInt(page);
  if (page == undefined || page < 0 || page > opts.pageCnt) page = 0;
  opts.styles.push("/static/css/cursos.css");
  const user = await findUserByJwt(req.cookies.jwt);
  opts.user = user?.dataValues;
  opts.admin = await isUserAdmin(user);
  opts.courses = (await Course.findAll({
    where: {
      isAvailable: true,
    },
    offset: Math.max(0, (page-1))*15,
    limit: 15,
    order: [
      ["name", "ASC"]
    ]
  })).map(course => course.dataValues);
  opts.page = page;
  if (page-1 > 0) opts.prevPage = page-1;
  if (page+1 <= opts.pageCnt) opts.nextPage = page+1;
  return res.render("/cursos/index", opts);
});

fastify.get("/cursos", async (req, res) => {
  return res.redirect("/cursos/1");
})