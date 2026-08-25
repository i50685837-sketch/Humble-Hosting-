const mongoose = require("mongoose");

const botSchema = new mongoose.Schema(
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
        BOT INFORMATION
        ==========================================
        */

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        description: {
            type: String,
            default: "",
            maxlength: 500
        },

        platform: {
            type: String,
            enum: [
                "whatsapp",
                "telegram",
                "discord"
            ],
            required: true
        },


        /*
        ==========================================
        BOT STATUS
        ==========================================
        */

        status: {
            type: String,
            enum: [
                "pending",
                "starting",
                "running",
                "stopped",
                "failed",
                "suspended"
            ],
            default: "pending"
        },


        /*
        ==========================================
        SOURCE / REPOSITORY
        ==========================================
        */

        githubRepo: {
            type: String,
            default: ""
        },

        githubBranch: {
            type: String,
            default: "main"
        },


        /*
        ==========================================
        RUNTIME
        ==========================================
        */

        startCommand: {
            type: String,
            default: "npm start"
        },

        nodeVersion: {
            type: String,
            default: "20"
        },

        port: {
            type: Number,
            default: null
        },


        /*
        ==========================================
        RESOURCES
        ==========================================
        */

        cpuLimit: {
            type: Number,
            default: 0.5
        },

        memoryLimit: {
            type: Number,
            default: 512
        },

        storageLimit: {
            type: Number,
            default: 1024
        },


        /*
        ==========================================
        MONITORING
        ==========================================
        */

        cpuUsage: {
            type: Number,
            default: 0
        },

        memoryUsage: {
            type: Number,
            default: 0
        },

        storageUsage: {
            type: Number,
            default: 0
        },

        networkUsage: {
            type: Number,
            default: 0
        },

        uptime: {
            type: Number,
            default: 0
        },


        /*
        ==========================================
        ENVIRONMENT VARIABLES
        ==========================================
        */

        environmentVariables: {
            type: Map,
            of: String,
            default: {}
        },


        /*
        ==========================================
        HOSTING PLAN
        ==========================================
        */

        plan: {
            type: String,
            enum: [
                "free",
                "basic",
                "pro",
                "business"
            ],
            default: "free"
        },

        monthlyCost: {
            type: Number,
            default: 0,
            min: 0
        },

        nextBillingDate: {
            type: Date,
            default: null
        },


        /*
        ==========================================
        BOT CONNECTION
        ==========================================
        */

        connectionStatus: {
            type: String,
            enum: [
                "disconnected",
                "connecting",
                "connected"
            ],
            default: "disconnected"
        },


        /*
        ==========================================
        PLATFORM IDENTIFIERS
        ==========================================
        */

        telegramBotId: {
            type: String,
            default: null
        },

        discordBotId: {
            type: String,
            default: null
        },

        whatsappSessionId: {
            type: String,
            default: null
        },


        /*
        ==========================================
        DEPLOYMENT
        ==========================================
        */

        lastDeploymentAt: {
            type: Date,
            default: null
        },

        lastDeploymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Deployment",
            default: null
        },


        /*
        ==========================================
        LOGGING
        ==========================================
        */

        lastError: {
            type: String,
            default: ""
        },

        lastStartedAt: {
            type: Date,
            default: null
        },

        lastStoppedAt: {
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

botSchema.index({
    user: 1,
    createdAt: -1
});

botSchema.index({
    platform: 1,
    status: 1
});


module.exports = mongoose.model("Bot", botSchema);
