const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema(
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
        DOMAIN INFORMATION
        ==========================================
        */

        domain: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        subdomain: {
            type: String,
            default: ""
        },


        /*
        ==========================================
        CONNECTED RESOURCE
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


        /*
        ==========================================
        DOMAIN STATUS
        ==========================================
        */

        status: {
            type: String,
            enum: [
                "pending",
                "active",
                "connected",
                "disconnected",
                "suspended",
                "expired"
            ],
            default: "pending"
        },


        /*
        ==========================================
        DNS
        ==========================================
        */

        dnsStatus: {
            type: String,
            enum: [
                "pending",
                "verified",
                "failed"
            ],
            default: "pending"
        },

        dnsRecords: {
            type: [
                {
                    type: {
                        type: String,
                        enum: [
                            "A",
                            "AAAA",
                            "CNAME",
                            "TXT",
                            "MX",
                            "NS"
                        ],
                        required: true
                    },

                    name: {
                        type: String,
                        default: "@"
                    },

                    value: {
                        type: String,
                        required: true
                    },

                    ttl: {
                        type: Number,
                        default: 3600
                    }
                }
            ],
            default: []
        },


        /*
        ==========================================
        SSL
        ==========================================
        */

        sslEnabled: {
            type: Boolean,
            default: false
        },

        sslStatus: {
            type: String,
            enum: [
                "not_requested",
                "pending",
                "active",
                "expired",
                "failed"
            ],
            default: "not_requested"
        },

        sslExpiresAt: {
            type: Date,
            default: null
        },


        /*
        ==========================================
        DOMAIN PROVIDER
        ==========================================
        */

        registrar: {
            type: String,
            default: ""
        },

        nameservers: {
            type: [String],
            default: []
        },


        /*
        ==========================================
        VERIFICATION
        ==========================================
        */

        verificationToken: {
            type: String,
            default: ""
        },

        verifiedAt: {
            type: Date,
            default: null
        },


        /*
        ==========================================
        EXPIRATION
        ==========================================
        */

        expiresAt: {
            type: Date,
            default: null
        },


        /*
        ==========================================
        AUTO RENEW
        ==========================================
        */

        autoRenew: {
            type: Boolean,
            default: false
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

domainSchema.index({
    user: 1,
    createdAt: -1
});

domainSchema.index({
    domain: 1
});

domainSchema.index({
    status: 1
});


/*
==================================================
NORMALIZE DOMAIN
==================================================
*/

domainSchema.pre("save", function(next) {

    if (this.domain) {
        this.domain = this.domain
            .toLowerCase()
            .trim()
            .replace(/^https?:\/\//, "")
            .replace(/\/+$/, "");
    }

    next();
});


module.exports = mongoose.model(
    "Domain",
    domainSchema
);
