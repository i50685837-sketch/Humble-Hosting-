// config/mpesa.js

require("dotenv").config();

const MPESA_ENV = (
    process.env.MPESA_ENV || "sandbox"
).toLowerCase();

const isProduction =
    MPESA_ENV === "production";

const mpesaConfig = {

    environment: MPESA_ENV,

    baseURL: isProduction
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke",

    consumerKey:
        process.env.MPESA_CONSUMER_KEY,

    consumerSecret:
        process.env.MPESA_CONSUMER_SECRET,

    shortcode:
        process.env.MPESA_SHORTCODE,

    passkey:
        process.env.MPESA_PASSKEY,

    callbackURL:
        process.env.MPESA_CALLBACK_URL,

    // STK transaction configuration
    transactionType:
        process.env.MPESA_TRANSACTION_TYPE ||
        "CustomerPayBillOnline",

    accountReference:
        process.env.MPESA_ACCOUNT_REFERENCE ||
        "HumbleHosting",

    transactionDesc:
        process.env.MPESA_TRANSACTION_DESC ||
        "Humble Hosting Wallet Deposit"
};


// =====================================================
// VALIDATE CONFIGURATION
// =====================================================

function validateMpesaConfig() {

    const required = [
        "consumerKey",
        "consumerSecret",
        "shortcode",
        "passkey",
        "callbackURL"
    ];

    const missing = required.filter(
        key => !mpesaConfig[key]
    );

    if (missing.length > 0) {

        console.warn(
            `⚠️ Missing M-PESA configuration: ${missing.join(", ")}`
        );

        return false;
    }

    return true;
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    mpesaConfig,
    validateMpesaConfig
};
