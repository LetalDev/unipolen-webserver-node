'use strict'

const { User, findUserByEmail } = require("./user");
const { Unit } = require("./unit");
const { Course } = require("./course");
const { Defaults } = require("./defaults");
const { CustomerUser } = require("./customerUser");
const { ADMIN_EMAIL, ADMIN_PASS, PASS_SALTS } = require("../environment");
const bcrypt = require("bcrypt");
const { AdminUser } = require("./adminUser");
const { Provider } = require("./provider");
const { Enrollment } = require("./enrollment");
// const { EnrollmentRequest } = require("./enrollmentRequest");

async function setupModels() {
  User.hasOne(AdminUser, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  AdminUser.belongsTo(User);

  User.hasOne(CustomerUser, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  CustomerUser.belongsTo(User);

  Provider.hasMany(Course, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  });
  Course.belongsTo(Provider);

  Enrollment.hasOne(Course);
  Course.hasMany(Enrollment);
  
  Enrollment.hasOne(CustomerUser);
  CustomerUser.hasMany(Enrollment);
}

async function addDefaultAdminAccount() {
  if (await findUserByEmail(ADMIN_EMAIL)) return;

  const user = await User.create({
    email: ADMIN_EMAIL,
    passwordHash: await bcrypt.hash(ADMIN_PASS, PASS_SALTS),
  });

  await user.createAdminUser();
}

module.exports = {
  setupModels,
  addDefaultAdminAccount,
}