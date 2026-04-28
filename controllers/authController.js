const { loginService } = require("../services/authService");
const bcrypt = require("bcrypt");
const User = require("../models/user");

// 🔓 LOGIN
exports.login = async (req, res) => {
  try {
    const result = await loginService({
      email: req.body.email,
      password: req.body.password,
      ip: req.ip,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({
      message: err.message,
    });
  }
};

// 🆕 REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      email,
      password: hash,
      role: "user", // default role
    });

    res.status(201).json({
      message: "User registered successfully ✅",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Registration failed",
    });
  }
};