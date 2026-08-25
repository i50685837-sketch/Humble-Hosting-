// middleware/rateLimiter.js

const rateLimit = require("express-rate-limit");

const mpesaRateLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many payment requests. Please try again later."
    }

});

module.exports = mpesaRateLimiter;
