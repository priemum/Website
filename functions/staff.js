const Users = require("../models/users");

async function is_staff(ID) {
  let user = await Users.findOne({ userID: ID });

  return user.staff;
}

//exports
module.exports = { is_staff };
