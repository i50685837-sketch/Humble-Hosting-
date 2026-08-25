// middleware/auth.js

const jwt = require("jsonwebtoken");

function auth(req, res, next) {

    try {

        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token = header.split(" ")[1];

        if (!process.env.JWT_SECRET) {
            console.error("❌ JWT_SECRET is missing");

            return res.status(500).json({
                success: false,
                message: "Server authentication is not configured"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired login token"
        });
    }
}

module.exports = auth;
