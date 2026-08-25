require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();


/*
==================================================
CONFIG
==================================================
*/

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;

const NODE_ENV =
    process.env.NODE_ENV || "development";


/*
==================================================
BASIC VALIDATION
==================================================
*/

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing");
    process.exit(1);
}


/*
==================================================
SECURITY
==================================================
*/

app.disable("x-powered-by");

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);


/*
==================================================
CORS
==================================================
*/

app.use(
    cors({
        origin: true,
        credentials: true
    })
);


/*
==================================================
BODY PARSING
==================================================
*/

app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "2mb"
    })
);


/*
==================================================
RATE LIMIT
==================================================
*/

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 300,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);


/*
==================================================
STATIC FRONTEND
==================================================
*/

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


/*
==================================================
HEALTH CHECK
==================================================
*/

app.get("/health", (req, res) => {

    res.json({
        success: true,
        service: "Humble Hosting",
        status: "online",
        environment: NODE_ENV,
        time: new Date().toISOString()
    });

});


/*
==================================================
API STATUS
==================================================
*/

app.get("/api", (req, res) => {

    res.json({
        success: true,
        message: "Humble Hosting API is running 🚀",
        version: "1.0.0"
    });

});


/*
==================================================
LOAD ROUTES
==================================================
*/

function loadRoute(pathName, routePath) {

    try {

        const route = require(routePath);

        app.use(pathName, route);

        console.log(
            `✅ ${pathName} loaded`
        );

    } catch (error) {

        console.error(
            `❌ Failed to load ${pathName}`
        );

        console.error(error.message);

    }

}


/*
==================================================
AUTH
==================================================
*/

loadRoute(
    "/api/auth",
    "./backend/routes/auth"
);


/*
==================================================
WALLET
==================================================
*/

loadRoute(
    "/api/wallet",
    "./backend/routes/wallet"
);


/*
==================================================
PROJECTS
==================================================
*/

loadRoute(
    "/api/projects",
    "./backend/routes/projects"
);


/*
==================================================
BOTS
==================================================
*/

loadRoute(
    "/api/bots",
    "./backend/routes/bots"
);


/*
==================================================
DEPLOYMENTS
==================================================
*/

loadRoute(
    "/api/deployments",
    "./backend/routes/deployments"
);


/*
==================================================
DOMAINS
==================================================
*/

loadRoute(
    "/api/domains",
    "./backend/routes/domains"
);


/*
==================================================
TRANSACTIONS
==================================================
*/

loadRoute(
    "/api/transactions",
    "./backend/routes/transactions"
);


/*
==================================================
USERS
==================================================
*/

loadRoute(
    "/api/users",
    "./backend/routes/users"
);


/*
==================================================
MONITORING
==================================================
*/

loadRoute(
    "/api/monitoring",
    "./backend/routes/monitoring"
);


/*
==================================================
M-PESA CALLBACK
==================================================
*/

/*
   IMPORTANT:

   Your Daraja callback should NOT be protected
   by the normal login middleware.

   Safaricom needs to reach this endpoint directly.

   The actual processing logic belongs in
   mpesaService.js / walletController.js.
*/

app.post(
    "/api/mpesa/callback",
    async (req, res) => {

        try {

            console.log(
                "📲 M-Pesa callback received"
            );

            console.log(
                JSON.stringify(
                    req.body,
                    null,
                    2
                )
            );


            /*
             * TODO:
             *
             * Pass callback data to your
             * M-Pesa service/controller.
             *
             * Example:
             *
             * await processMpesaCallback(req.body);
             */


            res.json({
                ResultCode: 0,
                ResultDesc: "Accepted"
            });

        } catch (error) {

            console.error(
                "M-Pesa callback error:",
                error
            );

            res.status(500).json({
                ResultCode: 1,
                ResultDesc: "Callback processing failed"
            });

        }

    }
);


/*
==================================================
404 API HANDLER
==================================================
*/

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({
            success: false,
            message: "API route not found"
        });

    }
);


/*
==================================================
FRONTEND FALLBACK
==================================================
*/

app.get(
    "*",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


/*
==================================================
GLOBAL ERROR HANDLER
==================================================
*/

app.use(
    (err, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            err
        );

        res.status(
            err.status || 500
        ).json({

            success: false,

            message:
                NODE_ENV === "production"
                    ? "Internal server error"
                    : err.message

        });

    }
);


/*
==================================================
MONGODB
==================================================
*/

async function connectDatabase() {

    try {

        await mongoose.connect(
            MONGO_URI
        );

        console.log(
            "✅ MongoDB Connected"
        );

    } catch (error) {

        console.error(
            "❌ MongoDB connection failed"
        );

        console.error(
            error.message
        );

        process.exit(1);

    }

}


/*
==================================================
START SERVER
==================================================
*/

async function startServer() {

    await connectDatabase();

    app.listen(
        PORT,
        "0.0.0.0",
        () => {

            console.log("");
            console.log(
                "===================================="
            );

            console.log(
                "🚀 HUMBLE HOSTING"
            );

            console.log(
                `🌐 Port: ${PORT}`
            );

            console.log(
                `🔧 Environment: ${NODE_ENV}`
            );

            console.log(
                "===================================="
            );

        }
    );

}


startServer();


/*
==================================================
GRACEFUL SHUTDOWN
==================================================
*/

process.on(
    "SIGTERM",
    async () => {

        console.log(
            "SIGTERM received. Shutting down..."
        );

        await mongoose.connection.close();

        process.exit(0);

    }
);


process.on(
    "SIGINT",
    async () => {

        console.log(
            "SIGINT received. Shutting down..."
        );

        await mongoose.connection.close();

        process.exit(0);

    }
);
