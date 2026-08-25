// middleware/validateMpesa.js

function validateMpesaDeposit(req, res, next) {

    const { phone, amount } = req.body || {};

    // -----------------------------
    // Phone validation
    // -----------------------------

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "M-PESA phone number is required"
        });
    }

    const cleanPhone = String(phone)
        .trim()
        .replace(/\s+/g, "")
        .replace(/-/g, "");

    const validPhone =
        /^(?:\+254|254|0)(?:1|7)\d{8}$/.test(cleanPhone);

    if (!validPhone) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid Kenyan M-PESA number"
        });
    }

    // -----------------------------
    // Amount validation
    // -----------------------------

    const numericAmount = Number(amount);

    if (
        !Number.isFinite(numericAmount) ||
        !Number.isInteger(numericAmount) ||
        numericAmount <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid whole-number amount"
        });
    }

    // Humble Hosting minimum deposit
    if (numericAmount < 10) {
        return res.status(400).json({
            success: false,
            message: "Minimum deposit is KES 10"
        });
    }

    // Prevent unreasonable request values
    if (numericAmount > 150000) {
        return res.status(400).json({
            success: false,
            message: "Deposit amount is too large"
        });
    }

    // -----------------------------
    // Store cleaned values
    // -----------------------------

    req.mpesa = {
        phone: cleanPhone,
        amount: numericAmount
    };

    next();
}

module.exports = validateMpesaDeposit;
