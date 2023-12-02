'use strict'

const { updateDefOpts, setup, listen } = require("./config");
const { setupDatabase, syncDatabase } = require("./database");
const { NODE_ENV } = require("./environment");
const { setupModels, addDefaultAdminAccount } = require("./models/setup");
const { removeLongLastingInactiveUsers } = require("./models/user");

async function main() {
  console.log("Starting unipolen server in " + NODE_ENV);

  await setupDatabase();
  await setup();

  //models
  await setupModels();
  await syncDatabase();
  await addDefaultAdminAccount();

  //controllers
  require("./controllers/pageError");
  require("./controllers/page404");
  require("./controllers/pageHome");
  require("./controllers/pageCourses");
  require("./controllers/pageCourse");
  require("./controllers/pageLogin");
  require("./controllers/pageForgotPassword");
  require("./controllers/pageRegister");
  require("./controllers/logout");
  require("./controllers/pageUnits");
  require("./controllers/pageUnit");
  require("./controllers/pagePartners");
  require("./controllers/pageAccount");
  require("./controllers/pageAdmin/components");
  require("./controllers/pageAdmin/courses");
  require("./controllers/pageAdmin/index");
  // require("./controllers/pageAdmin/sql");
  require("./controllers/pageAdmin/units");
  require("./controllers/pageAdmin/users");
  require("./controllers/pageAdmin/providers");
  require("./controllers/requestCourseEnrollment");

  async function routine() {
    updateDefOpts();
    removeLongLastingInactiveUsers();
    setTimeout(routine, 30000);
  }

  await routine();

  listen();
}

main();