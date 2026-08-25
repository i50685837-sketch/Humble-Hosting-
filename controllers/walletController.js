// backend/controllers/walletController.js

const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

// =====================================================
// GET WALLET
// GET /api/wallet
// =====================================================

async function getWallet(req, res) {
    try {
        const wallet = await Wallet.findOne({
            user: req.user.id
        });

        if (!wallet) {
            return res.json({
                success: true,
                wallet: {
                    balance: 0,
                    currency: "KES"
                }
            });
        }

        return res.json({
            success: true,
            wallet: {
                id: wallet._id,
                balance: Number(wallet.balance || 0),
                currency: wallet.currency || "KES"
            }
        });

    } catch (error) {
        console.error("GET WALLET ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load wallet"
        });
    }
}


// =====================================================
// GET TRANSACTIONS
// GET /api/wallet/transactions
// =====================================================

async function getTransactions(req, res) {
    try {
        const transactions =
            await Transaction.find({
                user: req.user.id
            })
            .sort({ createdAt: -1 })
            .limit(100);

        return res.json({
            success: true,
            transactions
        });

    } catch (error) {
        console.error(
            "GET TRANSACTIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load transactions"
        });
    }
}


// =====================================================
// CREATE WITHDRAWAL REQUEST
// POST /api/wallet/withdraw
// =====================================================

async function withdraw(req, res) {
    try {
        const amount = Number(req.body.amount);
        const phone = String(
            req.body.phone || ""
        ).trim();

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid withdrawal amount"
            });
        }

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "M-Pesa phone number is required"
            });
        }

        // Keep your business rules configurable.
        const minimumWithdrawal = Number(
            process.env.MIN_WITHDRAWAL || 100
        );

        if (amount < minimumWithdrawal) {
            return res.status(400).json({
                success: false,
                message:
                    `Minimum withdrawal is KES ${minimumWithdrawal}`
            });
        }

        const wallet =
            await Wallet.findOne({
                user: req.user.id
            });

        if (!wallet) {
            return res.status(400).json({
                success: false,
                message: "Wallet not found"
            });
        }

        if (Number(wallet.balance) < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient wallet balance"
            });
        }

        /*
         * Do not immediately deduct money and claim
         * that the withdrawal succeeded.
         *
         * Create a pending transaction first.
         */

        const transaction =
            await Transaction.create({
                user: req.user.id,
                type: "withdrawal",
                amount,
                status: "pending",
                phone,
                currency: "KES",
                description:
                    "Humble Hosting wallet withdrawal"
            });

        return res.status(201).json({
            success: true,
            message:
                "Withdrawal request submitted",
            transaction: {
                id: transaction._id,
                amount,
                status: transaction.status
            }
        });

    } catch (error) {
        console.error(
            "WITHDRAW ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to process withdrawal request"
        });
    }
}


// =====================================================
// WALLET SUMMARY
// GET /api/wallet/summary
// =====================================================

async function getSummary(req, res) {
    try {
        const wallet =
            await Wallet.findOne({
                user: req.user.id
            });

        const transactions =
            await Transaction.find({
                user: req.user.id
            })
            .sort({ createdAt: -1 })
            .limit(5);

        const balance =
            wallet ? Number(wallet.balance || 0) : 0;

        return res.json({
            success: true,

            balance,

            currency: "KES",

            recentTransactions:
                transactions
        });

    } catch (error) {
        console.error(
            "WALLET SUMMARY ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load wallet summary"
        });
    }
}


module.exports = {
    getWallet,
    getTransactions,
    withdraw,
    getSummary
};
