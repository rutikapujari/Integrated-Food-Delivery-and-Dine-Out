const nodemailer = require("nodemailer");

const getEmailConfig = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS && process.env.EMAIL_PASS.replace(/\s/g, "");

    if (!user || !pass) {
        throw new Error("EMAIL_USER and EMAIL_PASS must be set in backend/.env");
    }

    return { user, pass };
};

const sendEmail = async (to, subject, text) => {
    const { user, pass } = getEmailConfig();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user,
            pass
        }
    });

    const info = await transporter.sendMail({
        from: `"Food Delivery" <${user}>`,
        to,
        subject,
        text
    });

    console.log("Email sent:", info.messageId);
    return info;
};

module.exports = sendEmail;
