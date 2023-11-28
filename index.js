'use strict'

const { updateDefOpts, setup, listen } = require("./config");
const { setupDatabase, syncDatabase } = require("./database");
const { NODE_ENV } = require("./environment");
const { setupModels, addDefaultAdminAccount } = require("./models/setup");

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
  require("./controllers/pageAdmin");
  require("./controllers/pageCourses");
  require("./controllers/pageCourse");
  require("./controllers/pageLogin");
  require("./controllers/pageRegister");
  require("./controllers/logout");
  require("./controllers/pageUnits");
  require("./controllers/pageUnit");
  require("./controllers/pageAccount");

  async function routine() {
    updateDefOpts();
    setTimeout(routine, 30000);
  }

  await routine();

  listen();
}

main();