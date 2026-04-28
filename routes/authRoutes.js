const express = require("express");
const router = express.Router();

const { login } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// 🔓 Public route
router.post("/login", login);

// 🔐 Protected (any logged-in user)
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "User profile",
    user: req.user,
  });
});

// 👮 Admin only
router.get(
  "/admin",
  verifyToken,
  allowRoles("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin 🔥" });
  }
);

module.exports = router;