const app = require("./app");
const sequelize = require("./config/db");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/user");

sequelize.sync().then(async () => {
  console.log("Database synced");

  const existingUser = await User.findOne({
    where: { email: "test@gmail.com" },
  });

  if (!existingUser) {
    const hash = await bcrypt.hash("123456", 10);

    await User.create({
      email: "test@gmail.com",
      password: hash,
    });

    console.log("Test user created ✅");
  }

  app.listen(5000, () => {
    console.log("Server running at port 5000");
  });
});