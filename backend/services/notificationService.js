const sendEmail = require("./emailService");

const isEmailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const sendNotificationEmail = async (to, subject, html) => {
  if (!isEmailConfigured() || !to) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Email notification skipped: email config or recipient missing.");
    }
    return false;
  }

  try {
    await sendEmail(to, subject, html);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Email notification failed:", error.message);
    }
    return false;
  }
};

module.exports = {
  isEmailConfigured,
  sendNotificationEmail,
};
