const { loginService } = require("../services/authService");

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