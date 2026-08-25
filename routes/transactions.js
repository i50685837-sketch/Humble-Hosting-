const express = require("express");
const router = express.Router();

const {
    getTransactions,
    getTransaction
} = require("../controllers/walletController");

const authMiddleware = require("../middleware/authMiddleware");


/*
==================================================
AUTHENTICATION
==================================================
*/

router.use(authMiddleware);


/*
==================================================
TRANSACTIONS
==================================================
*/

// Get user's transaction history
// GET /api/transactions
router.get("/", getTransactions);


// Get one transaction
// GET /api/transactions/:id
router.get("/:id", getTransaction);


module.exports = router;
