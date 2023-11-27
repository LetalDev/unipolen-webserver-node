const { Role } = require("./role");
const { User } = require("./user");
const { Unit } = require("./unit");
const { Course } = require("./course");
const { Defaults } = require("./defaults");
const { ADMIN_EMAIL, ADMIN_PASS, PASS_SALTS } = require("../environment");
const bcrypt = require("bcrypt");

async function setupModels() {
  User.hasMany(Role);
  Role.belongsToMany(User, {
    through: 'UserRole',
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  });
}

async function addDefaultAdminAccount() {
  if (await User.findByEmail(ADMIN_EMAIL)) return;

  const user = await User.create({
    email: ADMIN_EMAIL,
    displayName: "admin",
    passwordHash: await bcrypt.hash(ADMIN_PASS, PASS_SALTS),
  });

  let role = await Role.findOne({where: {name: "admin"}});
  
  if (!role) role = await Role.create({name: "admin"});

  await user.addRole(role);
}

module.exports = {
  setupModels,
  addDefaultAdminAccount,
}