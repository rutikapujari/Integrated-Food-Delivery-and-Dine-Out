const express = require("express");
const router = express.Router();

const sendEmail = require("../utils/sendEmail");

router.get("/test-email", async (req, res) => {
    try {
        const to = process.env.EMAIL_TEST_TO || process.env.EMAIL_USER;

        if (!to) {
            return res.status(400).json({
                message: "Set EMAIL_TEST_TO or EMAIL_USER in backend/.env"
            });
        }

        const info = await sendEmail(
            to,
            "Test Mail",
            "Email working successfully"
        );

        res.status(200).json({
            message: "Mail Sent",
            messageId: info.messageId
        });
    } catch (error) {
        if (error.code === "EAUTH" || /Username and Password not accepted/i.test(error.message)) {
            return res.status(401).json({
                message: "Gmail rejected EMAIL_USER or EMAIL_PASS. Create a new Gmail App Password for this exact EMAIL_USER, update backend/.env, then restart the server."
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
