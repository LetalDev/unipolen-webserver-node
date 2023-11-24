'use strict'

const { updateDefOpts, setup } = require("./config");

async function main() {
  await setup();

  //base
  require("./environment");
  require("./database");

  //middleware
  // require("./middleware/authenticator");

  //controllers
  require("./controllers/pageError");
  require("./controllers/page404");
  require("./controllers/pageHome");
  require("./controllers/pageAdmin");
  require("./controllers/pageCourses");
  require("./controllers/pageLogin");
  require("./controllers/pageRegister");
  require("./controllers/logout");
  require("./controllers/pageUnits");
  require("./controllers/pageAccount");

  async function routine() {
    updateDefOpts();
    setTimeout(routine, 10000);
  }

  await routine();
}

main();