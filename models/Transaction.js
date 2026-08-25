const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
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
            index: true
        },


        /*
        ==========================================
        TRANSACTION TYPE
        ==========================================
        */

        type: {
            type: String,
            enum: [
                "deposit",
                "withdrawal",
                "hosting_payment",
                "bot_payment",
                "domain_payment",
                "refund",
                "credit",
                "debit"
            ],
            required: true
        },


        /*
        ==========================================
        AMOUNT
        ==========================================
        */

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "KES",
            uppercase: true
        },


        /*
        ==========================================
        TRANSACTION STATUS
        ==========================================
        */

        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "completed",
                "failed",
                "cancelled",
                "reversed"
            ],
            default: "pending",
            index: true
        },


        /*
        ==========================================
        PAYMENT PROVIDER
        ==========================================
        */

        provider: {
            type: String,
            enum: [
                "mpesa",
                "pesapal",
                "paystack",
                "manual",
                "wallet"
            ],
            default: "wallet"
        },


        /*
        ==========================================
        MPESA / PAYMENT REFERENCES
        ==========================================
        */

        phoneNumber: {
            type: String,
            default: ""
        },

        checkoutRequestId: {
            type: String,
            default: ""
        },

        merchantRequestId: {
            type: String,
            default: ""
        },

        mpesaReceiptNumber: {
            type: String,
            default: ""
        },


        /*
        ==========================================
        EXTERNAL REFERENCE
        ==========================================
        */

        reference: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        externalReference: {
            type: String,
            default: ""
        },


        /*
        ==========================================
        RELATED RESOURCES
        ==========================================
        */

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null
        },

        bot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bot",
            default: null
        },

        domain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Domain",
            default: null
        },


        /*
        ==========================================
        WALLET BALANCE
        ==========================================
        */

        balanceBefore: {
            type: Number,
            default: 0
        },

        balanceAfter: {
            type: Number,
            default: 0
        },


        /*
        ==========================================
        DESCRIPTION
        ==========================================
        */

        description: {
            type: String,
            default: ""
        },

        failureReason: {
            type: String,
            default: ""
        },


        /*
        ==========================================
        PAYMENT CALLBACK
        ==========================================
        */

        callbackData: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },


        /*
        ==========================================
        COMPLETION
        ==========================================
        */

        completedAt: {
            type: Date,
            default: null
        }

    },
    {
        timestamps: true
    }
);


/*
==================================================
INDEXES
==================================================
*/

transactionSchema.index({
    user: 1,
    createdAt: -1
});

transactionSchema.index({
    provider: 1,
    status: 1
});

transactionSchema.index({
    checkoutRequestId: 1
});

transactionSchema.index({
    mpesaReceiptNumber: 1
});


/*
==================================================
AUTO COMPLETION DATE
==================================================
*/

transactionSchema.pre("save", function(next) {

    if (
        this.status === "completed" &&
        !this.completedAt
    ) {
        this.completedAt = new Date();
    }

    next();
});


module.exports = mongoose.model(
    "Transaction",
    transactionSchema
);
