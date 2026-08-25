const express = require("express");
const router = express.Router();

const {
    getWallet,
    deposit,
    withdraw,
    getTransactions
} = require("../controllers/walletController");

const authMiddleware = require("../middleware/authMiddleware");


/*
==================================================
ALL WALLET ROUTES REQUIRE LOGIN
==================================================
*/

router.use(authMiddleware);


/*
==================================================
WALLET
==================================================
*/

// GET /api/wallet
router.get("/", getWallet);


/*
==================================================
DEPOSIT
==================================================
*/

// POST /api/wallet/deposit
//
// Body:
// {
//     "amount": 100,
//     "phone": "2547XXXXXXXX"
// }

router.post("/deposit", deposit);


/*
==================================================
WITHDRAW
==================================================
*/

// POST /api/wallet/withdraw
//
// Body:
// {
//     "amount": 100,
//     "phone": "2547XXXXXXXX"
// }

router.post("/withdraw", withdraw);


/*
==================================================
TRANSACTIONS
==================================================
*/

// GET /api/wallet/transactions
router.get("/transactions", getTransactions);


module.exports = router;
