require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");

const app = express();

/* =========================================================
   CONFIG
========================================================= */

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const MPESA_ENV = process.env.MPESA_ENV || "sandbox";

const MPESA_BASE_URL =
    MPESA_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;

const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;

const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL;


/* =========================================================
   EXPRESS MIDDLEWARE
========================================================= */

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({
    limit: "2mb"
}));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, "public")));


/* =========================================================
   BASIC HEALTH CHECK
========================================================= */

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Humble Hosting API is running",
        environment: process.env.NODE_ENV || "development",
        mpesa: MPESA_ENV
    });
});


/* =========================================================
   MONGODB
========================================================= */

if (MONGO_URI) {
    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log("✅ MongoDB connected");
        })
        .catch((error) => {
            console.error("❌ MongoDB connection failed:");
            console.error(error.message);
        });
} else {
    console.warn("⚠️ MONGO_URI is not configured");
}


/* =========================================================
   LOAD APPLICATION ROUTES
========================================================= */

function loadRoute(url, file) {
    try {
        const router = require(file);

        app.use(url, router);

        console.log(`✅ Loaded ${url}`);
    } catch (error) {
        console.error(`❌ Failed to load ${url}`);
        console.error(error.message);
    }
}

loadRoute("/api/auth", "./backend/routes/auth");
loadRoute("/api/wallet", "./backend/routes/wallet");
loadRoute("/api/projects", "./backend/routes/projects");
loadRoute("/api/bots", "./backend/routes/bots");
loadRoute("/api/deployments", "./backend/routes/deployments");
loadRoute("/api/domains", "./backend/routes/domains");
loadRoute("/api/transactions", "./backend/routes/transactions");
loadRoute("/api/users", "./backend/routes/users");
loadRoute("/api/monitoring", "./backend/routes/monitoring");


/* =========================================================
   MPESA HELPERS
========================================================= */

function normalizePhone(phone) {
    if (!phone) return null;

    let value = String(phone).trim();

    value = value.replace(/\s+/g, "");

    if (value.startsWith("+254")) {
        value = value.substring(1);
    }

    if (value.startsWith("07") || value.startsWith("01")) {
        value = "254" + value.substring(1);
    }

    if (value.startsWith("7") || value.startsWith("1")) {
        value = "254" + value;
    }

    if (!/^254[17]\d{8}$/.test(value)) {
        return null;
    }

    return value;
}


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
    return Buffer.from(
        `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString("base64");
}


/* =========================================================
   DARaja OAuth TOKEN
========================================================= */

async function getMpesaAccessToken() {

    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
        throw new Error(
            "MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET is missing"
        );
    }

    const credentials = Buffer.from(
        `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const response = await axios.get(
        `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
            headers: {
                Authorization: `Basic ${credentials}`
            },
            timeout: 30000
        }
    );

    if (!response.data || !response.data.access_token) {
        throw new Error("M-Pesa access token was not returned");
    }

    return response.data.access_token;
}


/* =========================================================
   MPESA STK PUSH
========================================================= */

app.post("/api/mpesa/stkpush", async (req, res) => {

    try {

        const {
            phone,
            amount,
            accountReference,
            transactionDesc
        } = req.body;

        /* -----------------------------------------------
           Validate amount
        ------------------------------------------------ */

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount"
            });
        }

        /* -----------------------------------------------
           Validate phone
        ------------------------------------------------ */

        const normalizedPhone = normalizePhone(phone);

        if (!normalizedPhone) {
            return res.status(400).json({
                success: false,
                message: "Invalid Kenyan phone number"
            });
        }

        /* -----------------------------------------------
           Validate Daraja configuration
        ------------------------------------------------ */

        if (
            !MPESA_SHORTCODE ||
            !MPESA_PASSKEY ||
            !MPESA_CALLBACK_URL
        ) {
            return res.status(500).json({
                success: false,
                message: "M-Pesa configuration is incomplete"
            });
        }

        /* -----------------------------------------------
           Get OAuth token
        ------------------------------------------------ */

        const accessToken = await getMpesaAccessToken();

        /* -----------------------------------------------
           Timestamp + password
        ------------------------------------------------ */

        const timestamp = generateTimestamp();

        const password = generatePassword(timestamp);

        /* -----------------------------------------------
           STK request
        ------------------------------------------------ */

        const payload = {
            BusinessShortCode: MPESA_SHORTCODE,

            Password: password,

            Timestamp: timestamp,

            TransactionType: "CustomerPayBillOnline",

            Amount: Math.floor(numericAmount),

            PartyA: normalizedPhone,

            PartyB: MPESA_SHORTCODE,

            PhoneNumber: normalizedPhone,

            CallBackURL: MPESA_CALLBACK_URL,

            AccountReference:
                accountReference || "HUMBLE-HOSTING",

            TransactionDesc:
                transactionDesc || "Humble Hosting payment"
        };

        console.log("📲 Sending M-Pesa STK Push");
        console.log({
            phone: normalizedPhone,
            amount: Math.floor(numericAmount)
        });

        const response = await axios.post(
            `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        console.log("✅ STK Push response:", response.data);

        return res.json({
            success: true,
            message:
                response.data.CustomerMessage ||
                "STK Push sent successfully",

            data: response.data
        });

    } catch (error) {

        console.error("❌ STK Push failed");

        if (error.response) {
            console.error(
                "Safaricom response:",
                error.response.data
            );

            return res.status(
                error.response.status || 500
            ).json({
                success: false,
                message:
                    error.response.data?.errorMessage ||
                    error.response.data?.ResponseDescription ||
                    "M-Pesa request failed",

                error: error.response.data
            });
        }

        console.error(error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to initiate M-Pesa payment",
            error: error.message
        });
    }
});


/* =========================================================
   MPESA CALLBACK
========================================================= */

app.post("/api/mpesa/callback", async (req, res) => {

    try {

        console.log(
            "📥 M-Pesa callback received"
        );

        console.log(
            JSON.stringify(req.body, null, 2)
        );

        const stkCallback =
            req.body?.Body?.stkCallback;

        if (!stkCallback) {

            return res.json({
                ResultCode: 0,
                ResultDesc: "Accepted"
            });
        }

        const resultCode =
            stkCallback.ResultCode;

        const resultDesc =
            stkCallback.ResultDesc;

        const checkoutRequestID =
            stkCallback.CheckoutRequestID;

        const merchantRequestID =
            stkCallback.MerchantRequestID;

        console.log("M-Pesa ResultCode:", resultCode);
        console.log("M-Pesa ResultDesc:", resultDesc);

        /* -----------------------------------------------
           Successful payment
        ------------------------------------------------ */

        if (resultCode === 0) {

            const items =
                stkCallback.CallbackMetadata?.Item || [];

            const metadata = {};

            for (const item of items) {

                if (item.Name) {
                    metadata[item.Name] =
                        item.Value;
                }
            }

            console.log("✅ M-Pesa payment successful");

            console.log({
                checkoutRequestID,
                merchantRequestID,
                amount: metadata.Amount,
                receipt: metadata.MpesaReceiptNumber,
                phone: metadata.PhoneNumber,
                transactionDate: metadata.TransactionDate
            });

            /*
             * IMPORTANT:
             *
             * This is where you should update the user's
             * wallet / transaction in MongoDB.
             *
             * Do NOT credit a wallet merely because the
             * STK request was initiated.
             *
             * Credit only after ResultCode === 0.
             */
        }

        return res.json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });

    } catch (error) {

        console.error(
            "❌ M-Pesa callback error:",
            error.message
        );

        return res.json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });
    }
});


/* =========================================================
   MPESA CONFIG CHECK
========================================================= */

app.get("/api/mpesa/status", (req, res) => {

    res.json({
        success: true,

        environment: MPESA_ENV,

        configured: {
            consumerKey: Boolean(MPESA_CONSUMER_KEY),
            consumerSecret: Boolean(MPESA_CONSUMER_SECRET),
            shortcode: Boolean(MPESA_SHORTCODE),
            passkey: Boolean(MPESA_PASSKEY),
            callbackUrl: Boolean(MPESA_CALLBACK_URL)
        },

        baseUrl: MPESA_BASE_URL
    });
});


/* =========================================================
   404 API HANDLER
========================================================= */

app.use("/api", (req, res) => {

    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});


/* =========================================================
   FRONTEND FALLBACK
========================================================= */

/*
 * Do NOT use:
 *
 * app.get("*", ...)
 *
 * with your current Express/router version.
 *
 * The middleware below avoids the path-to-regexp
 * wildcard error shown in your Render logs.
 */

app.use((req, res, next) => {

    if (req.method !== "GET") {
        return next();
    }

    const indexPath =
        path.join(__dirname, "public", "index.html");

    res.sendFile(indexPath, (error) => {

        if (error) {
            next(error);
        }

    });
});


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {

    console.error("❌ Server error:");
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});


/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {

    console.log("");
    console.log("========================================");
    console.log("🚀 HUMBLE HOSTING SERVER");
    console.log("========================================");
    console.log(`🌐 Port: ${PORT}`);
    console.log(`📡 M-Pesa: ${MPESA_ENV}`);
    console.log(`🔗 API: /api`);
    console.log(`❤️ Health: /health`);
    console.log("========================================");
    console.log("");
});
