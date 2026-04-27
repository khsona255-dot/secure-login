const app = require("./app");
const sequelize = require("./config/db");
const bcrypt = require("bcrypt");
const User = require("./models/user");

sequelize.sync().then(async () => {
  console.log("Server running at port 5000");

  // ✅ Check if user already exists
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
  } else {
    console.log("User already exists ✅");
  }

  app.listen(5000);
});