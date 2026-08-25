// services/mpesaService.js

const axios = require("axios");

const MPESA_ENV = process.env.MPESA_ENV || "sandbox";

const BASE_URL =
    MPESA_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";


// =====================================================
// GET DARAJA ACCESS TOKEN
// =====================================================

async function getAccessToken() {

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        throw new Error(
            "MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET is missing"
        );
    }

    const credentials = Buffer
        .from(`${consumerKey}:${consumerSecret}`)
        .toString("base64");

    try {

        const response = await axios.get(
            `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    Authorization: `Basic ${credentials}`
                },
                timeout: 15000
            }
        );

        if (!response.data.access_token) {
            throw new Error("Daraja did not return an access token");
        }

        return response.data.access_token;

    } catch (error) {

        console.error(
            "❌ Daraja OAuth error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to authenticate with M-PESA Daraja");
    }
}


// =====================================================
// GENERATE STK PASSWORD
// =====================================================

function generateTimestamp() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}


function generatePassword(timestamp) {

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;

    if (!shortcode || !passkey) {
        throw new Error(
            "MPESA_SHORTCODE or MPESA_PASSKEY is missing"
        );
    }

    return Buffer
        .from(`${shortcode}${passkey}${timestamp}`)
        .toString("base64");
}


// =====================================================
// STK PUSH
// =====================================================

async function initiateSTKPush({
    phone,
    amount,
    accountReference = "HumbleHosting",
    transactionDesc = "Humble Hosting Deposit"
}) {

    if (!phone) {
        throw new Error("Phone number is required");
    }

    if (!amount || Number(amount) <= 0) {
        throw new Error("A valid deposit amount is required");
    }

    const token = await getAccessToken();

    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    const shortcode = process.env.MPESA_SHORTCODE;
    const callbackURL = process.env.MPESA_CALLBACK_URL;

    if (!callbackURL) {
        throw new Error("MPESA_CALLBACK_URL is missing");
    }

    const formattedPhone = formatKenyanPhone(phone);

    const payload = {

        BusinessShortCode: shortcode,

        Password: password,

        Timestamp: timestamp,

        TransactionType: "CustomerPayBillOnline",

        Amount: Math.round(Number(amount)),

        PartyA: formattedPhone,

        PartyB: shortcode,

        PhoneNumber: formattedPhone,

        CallBackURL: callbackURL,

        AccountReference: accountReference,

        TransactionDesc: transactionDesc
    };

    try {

        const response = await axios.post(
            `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                timeout: 20000
            }
        );

        console.log(
            "✅ STK Push response:",
            response.data
        );

        return response.data;

    } catch (error) {

        console.error(
            "❌ STK Push error:",
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.errorMessage ||
            "Unable to initiate M-PESA STK Push"
        );
    }
}


// =====================================================
// PHONE NUMBER FORMATTER
// =====================================================

function formatKenyanPhone(phone) {

    let value = String(phone)
        .trim()
        .replace(/\s+/g, "")
        .replace(/-/g, "");

    if (value.startsWith("+254")) {
        value = value.substring(1);
    }

    if (value.startsWith("07") || value.startsWith("01")) {
        value = "254" + value.substring(1);
    }

    if (!/^254\d{9}$/.test(value)) {
        throw new Error(
            "Invalid Kenyan M-PESA phone number"
        );
    }

    return value;
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getAccessToken,
    initiateSTKPush,
    formatKenyanPhone
};
