const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
    {
        /*
        ==========================================
        OWNER
        ==========================================
        */

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },


        /*
        ==========================================
        BALANCE
        ==========================================
        */

        balance: {
            type: Number,
            default: 0,
            min: 0
        },

        currency: {
            type: String,
            default: "KES",
            uppercase: true
        },


        /*
        ==========================================
        TOTALS
        ==========================================
        */

        totalDeposited: {
            type: Number,
            default: 0,
            min: 0
        },

        totalWithdrawn: {
            type: Number,
            default: 0,
            min: 0
        },

        totalSpent: {
            type: Number,
            default: 0,
            min: 0
        },


        /*
        ==========================================
        WALLET STATUS
        ==========================================
        */

        status: {
            type: String,
            enum: [
                "active",
                "locked",
                "suspended"
            ],
            default: "active"
        },


        /*
        ==========================================
        LAST ACTIVITY
        ==========================================
        */

        lastDepositAt: {
            type: Date,
            default: null
        },

        lastWithdrawalAt: {
            type: Date,
            default: null
        },

        lastTransactionAt: {
            type: Date,
            default: null
        },


        /*
        ==========================================
        M-PESA
        ==========================================
        */

        mpesaPhone: {
            type: String,
            default: ""
        }

    },
    {
        timestamps: true
    }
);


/*
==================================================
INDEX
==================================================
*/

walletSchema.index({
    user: 1
});


/*
==================================================
HELPER METHODS
==================================================
*/

walletSchema.methods.canAfford = function(amount) {

    return (
        this.status === "active" &&
        this.balance >= Number(amount)
    );

};


walletSchema.methods.addBalance = function(amount) {

    amount = Number(amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid amount");
    }

    this.balance += amount;

    this.totalDeposited += amount;

    this.lastDepositAt = new Date();

    this.lastTransactionAt = new Date();

    return this.balance;
};


walletSchema.methods.deductBalance = function(amount) {

    amount = Number(amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid amount");
    }

    if (!this.canAfford(amount)) {
        throw new Error("Insufficient wallet balance");
    }

    this.balance -= amount;

    this.totalSpent += amount;

    this.lastTransactionAt = new Date();

    return this.balance;
};


module.exports = mongoose.model(
    "Wallet",
    walletSchema
);
