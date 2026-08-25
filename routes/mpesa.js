// routes/mpesa.js

const express = require("express");

const router = express.Router();

const {
    stkPush,
    mpesaCallback
} = require("../controllers/mpesaController");

const auth = require("../middleware/auth");

const validateMpesaDeposit =
    require("../middleware/validateMpesa");

const mpesaRateLimiter =
    require("../middleware/rateLimiter");


// =====================================================
// M-PESA STK PUSH
// POST /api/mpesa/stkpush
// =====================================================
//
// User must be logged in.
// Request body:
//
// {
//   "phone": "0712345678",
//   "amount": 100
// }
//

router.post(
    "/stkpush",
    auth,
    validateMpesaDeposit,
    mpesaRateLimiter,
    stkPush
);


// =====================================================
// M-PESA CALLBACK
// POST /api/mpesa/callback
// =====================================================
//
// Safaricom calls this endpoint after the STK request.
//
// DO NOT add normal JWT authentication here.
//

router.post(
    "/callback",
    mpesaCallback
);


module.exports = router;
