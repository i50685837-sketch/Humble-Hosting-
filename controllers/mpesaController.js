// controllers/mpesaController.js

const {
    initiateSTKPush,
    formatKenyanPhone
} = require("../services/mpesaService");


// =====================================================
// START STK PUSH
// POST /api/mpesa/stkpush
// =====================================================

async function stkPush(req, res) {

    try {

        const {
            phone,
            amount
        } = req.body;

        // -----------------------------
        // Validate phone
        // -----------------------------

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        // -----------------------------
        // Validate amount
        // -----------------------------

        const numericAmount = Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid deposit amount"
            });
        }

        // Optional minimum deposit
        if (numericAmount < 10) {
            return res.status(400).json({
                success: false,
                message: "Minimum deposit is KES 10"
            });
        }

        // -----------------------------
        // Format phone
        // -----------------------------

        const formattedPhone = formatKenyanPhone(phone);

        // -----------------------------
        // Start STK Push
        // -----------------------------

        const result = await initiateSTKPush({
            phone: formattedPhone,
            amount: numericAmount,
            accountReference: "HumbleHosting",
            transactionDesc: "Humble Hosting Wallet Deposit"
        });

        // -----------------------------
        // Daraja response
        // -----------------------------

        return res.status(200).json({

            success: true,

            message:
                result.CustomerMessage ||
                "STK Push sent successfully",

            merchantRequestID:
                result.MerchantRequestID,

            checkoutRequestID:
                result.CheckoutRequestID,

            responseCode:
                result.ResponseCode,

            responseDescription:
                result.ResponseDescription
        });

    } catch (error) {

        console.error(
            "❌ STK controller error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: error.message ||
                "Unable to start M-PESA payment"
        });
    }
}


// =====================================================
// DARAJA CALLBACK
// POST /api/mpesa/callback
// =====================================================

async function mpesaCallback(req, res) {

    try {

        console.log(
            "📥 M-PESA callback received"
        );

        console.log(
            JSON.stringify(
                req.body,
                null,
                2
            )
        );

        /*
         * IMPORTANT
         *
         * Do NOT automatically credit the wallet here
         * just because a callback arrived.
         *
         * The callback must be checked for:
         *
         * ResultCode === 0
         *
         * Then validate:
         *
         * - CheckoutRequestID
         * - Amount
         * - PhoneNumber
         * - MpesaReceiptNumber
         * - Transaction ownership
         *
         * against your database.
         */

        const stkCallback =
            req.body?.Body?.stkCallback;

        if (!stkCallback) {

            return res.json({
                ResultCode: 0,
                ResultDesc: "Callback received"
            });
        }

        const resultCode =
            stkCallback.ResultCode;

        const checkoutRequestID =
            stkCallback.CheckoutRequestID;

        // -----------------------------------------
        // Payment failed / cancelled
        // -----------------------------------------

        if (Number(resultCode) !== 0) {

            console.log(
                "⚠️ M-PESA payment unsuccessful:",
                resultCode
            );

            return res.json({
                ResultCode: 0,
                ResultDesc: "Callback processed"
            });
        }

        // -----------------------------------------
        // Successful STK transaction
        // -----------------------------------------

        const metadata =
            stkCallback.CallbackMetadata?.Item || [];

        const getMetadata = (name) => {

            const item = metadata.find(
                entry => entry.Name === name
            );

            return item?.Value;
        };

        const amount =
            Number(getMetadata("Amount") || 0);

        const receipt =
            getMetadata("MpesaReceiptNumber");

        const phone =
            getMetadata("PhoneNumber");

        console.log(
            "✅ M-PESA payment successful"
        );

        console.log({
            checkoutRequestID,
            amount,
            receipt,
            phone
        });

        /*
         * NEXT STEP:
         *
         * Find the pending transaction using
         * CheckoutRequestID.
         *
         * Verify it has not already been processed.
         *
         * Then credit the user's wallet.
         *
         * Example:
         *
         * transaction.status = "completed";
         * transaction.receipt = receipt;
         * user.walletBalance += amount;
         *
         * Save both atomically in MongoDB.
         */

        return res.json({
            ResultCode: 0,
            ResultDesc: "Callback processed successfully"
        });

    } catch (error) {

        console.error(
            "❌ M-PESA callback error:",
            error
        );

        /*
         * Always respond to Daraja so the callback
         * endpoint does not remain hanging.
         */

        return res.json({
            ResultCode: 0,
            ResultDesc: "Callback received"
        });
    }
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    stkPush,
    mpesaCallback
};
