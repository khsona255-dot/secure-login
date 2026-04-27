const nodemailer = require("nodemailer"); // ✅ ADD THIS

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "khsona255@gmail.com",
    pass: "umeswatngpzsriul",
  },
});

exports.sendMail = async (to, subject, text) => {
  await transporter.sendMail({
    from: "khsona255@gmail.com",
    to,
    subject,
    text,
  });
};