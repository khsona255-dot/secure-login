const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const LoginAttempt = require("../models/loginAttempt");
const sendMail = require("../utils/mail");
const { Op } = require("sequelize");

exports.loginService = async ({ email, password, ip }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw { code: 404, message: "User not found" };

  const now = new Date();

  // 🔒 Permanent block
  if (user.isBlocked) {
    throw {
      code: 403,
      message: "Your account has been locked, please contact support",
    };
  }

  // ⏳ Temporary lock
  if (user.lockUntil && user.lockUntil > now) {
    throw {
      code: 429,
      message: "Your account has been blocked, try again later",
    };
  }

  // ⛔ Throttle delay
  if (user.nextAllowedAt && user.nextAllowedAt > now) {
    throw {
      code: 429,
      message: "Too many attempts. Please wait before trying again",
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  // ❌ FAILED LOGIN
  if (!isMatch) {
    await LoginAttempt.create({
      userId: user.id,
      ipAddress: ip,
      status: "failed",
    });

    // 🔴 15 min window
    const attempts15 = await LoginAttempt.count({
      where: {
        userId: user.id,
        ipAddress: ip,
        status: "failed",
        createdAt: {
          [Op.gte]: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
    });

    // 🚨 LOCK
    if (attempts15 >= 10) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      user.lockCount += 1;

      await LoginAttempt.create({
        userId: user.id,
        ipAddress: ip,
        status: "lock",
      });

      // 🔥 24h escalation
      const lockCount24h = await LoginAttempt.count({
        where: {
          userId: user.id,
          status: "lock",
          createdAt: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      await sendMail(
        user.email,
        "Account Locked",
        "Too many failed attempts. Try again after 15 minutes."
      );

      if (lockCount24h >= 3) {
        user.isBlocked = true;

        await sendMail(
          user.email,
          "Account Permanently Locked",
          "Contact support to unlock your account."
        );
      }

      user.throttleCount = 0;
      user.nextAllowedAt = null;

      await user.save();

      throw {
        code: 403,
        message: "Your account has been locked, try again later",
      };
    }

    // 🟡 5 min throttling
    const attempts5 = await LoginAttempt.count({
      where: {
        userId: user.id,
        ipAddress: ip,
        status: "failed",
        createdAt: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
    });

    if (attempts5 >= 5) {
      user.throttleCount += 1;

      const delay = 30000 * Math.pow(2, user.throttleCount - 1);

      user.nextAllowedAt = new Date(Date.now() + delay);

      await user.save();

      throw {
        code: 429,
        message: `Too many attempts. Try again after ${delay / 1000}s`,
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
  user.throttleCount = 0;
  user.nextAllowedAt = null;

  await user.save();

  // 🔐 JWT TOKEN
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    message: "Login successful",
    token,
  };
};