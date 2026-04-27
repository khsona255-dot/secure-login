const bcrypt = require("bcrypt");
const User = require("../models/user");
const LoginAttempt = require("../models/loginAttempt");
const sendMail = require("../utils/mail"); // ✅ FIXED IMPORT
const { Op } = require("sequelize");

exports.loginService = async ({ email, password, ip }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw { code: 404, message: "User not found" };

  const now = new Date();

  // ❌ Permanent block
  if (user.isBlocked) {
    throw { code: 403, message: "Your account has been locked, please contact support" };
  }

  // ⏳ Temporary lock
  if (user.lockUntil && user.lockUntil > now) {
    throw { code: 429, message: "Your account has been blocked, try again later" };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  // ❌ FAILED LOGIN
  if (!isMatch) {
    await LoginAttempt.create({
      userId: user.id,
      ipAddress: ip,
      status: "failed",
    });

    // 🔴 15 min window (lock condition)
    const attempts15 = await LoginAttempt.count({
      where: {
        userId: user.id,
        status: "failed",
        createdAt: {
          [Op.gte]: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
    });

    if (attempts15 >= 10) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);

      user.lockCount = (user.lockCount || 0) + 1;

      await sendMail(
        user.email,
        "Account Locked",
        "Too many failed login attempts. Try again after 15 minutes."
      );

      // 🔥 Escalation
      if (user.lockCount >= 3) {
        user.isBlocked = true;

        await sendMail(
          user.email,
          "Account Permanently Locked",
          "Your account has been permanently blocked. Contact support."
        );
      }

      await user.save();

      throw { code: 403, message: "Your account has been locked, try again later" };
    }

    // 🟡 5 min throttling
    const attempts5 = await LoginAttempt.count({
      where: {
        userId: user.id,
        status: "failed",
        createdAt: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
    });

    if (attempts5 >= 5) {
      const delay = Math.pow(2, user.lockCount || 0) * 30000;

      throw {
        code: 429,
        message: `Too many attempts. Wait ${delay / 1000}s`,
      };
    }

    throw { code: 401, message: "Invalid password" };
  }

  // ✅ SUCCESS LOGIN
  await LoginAttempt.create({
    userId: user.id,
    ipAddress: ip,
    status: "success",
  });

  user.lockUntil = null;
  user.nextAllowedAt = null;

  await user.save();

  return { message: "Login successful" };
};