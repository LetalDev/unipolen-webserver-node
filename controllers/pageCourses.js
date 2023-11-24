const { fastify, defOpts } = require("../config");
const { getActiveCoursesInRange, getActiveCourseCount } = require("../models/course");
const { getUserFromJwt, isUserAdmin } = require("../models/user");

fastify.get("/cursos/:page", async (req, res) => {
  let { page } = req.params;
  page = Number.parseInt(page);
  const opts = structuredClone(defOpts);
  opts.styles.push("/static/css/cursos.css");
  opts.user = await getUserFromJwt(req.cookies.jwt);
  opts.admin = await isUserAdmin(opts.user.id);
  opts.courses = await getActiveCoursesInRange(Math.max(0, (page-1))*15, 15);
  opts.page = page;
  opts.pageCnt = await getActiveCourseCount() / 15 + 1;
  if (page-1 > 0) opts.prevPage = page-1;
  if (page+1 <= opts.pageCnt) opts.nextPage = page+1;
  return res.render("/cursos/index", opts);
});

fastify.get("/cursos", async (req, res) => {
  return res.redirect("/cursos/1");
})