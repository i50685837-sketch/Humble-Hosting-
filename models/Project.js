const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
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
        PROJECT INFORMATION
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

        type: {
            type: String,
            enum: [
                "node",
                "react",
                "static",
                "python",
                "other"
            ],
            default: "node"
        },


        /*
        ==========================================
        GITHUB
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
        DEPLOYMENT
        ==========================================
        */

        status: {
            type: String,
            enum: [
                "pending",
                "building",
                "running",
                "stopped",
                "failed",
                "suspended"
            ],
            default: "pending"
        },

        deploymentUrl: {
            type: String,
            default: ""
        },

        port: {
            type: Number,
            default: null
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

        buildCommand: {
            type: String,
            default: "npm install"
        },

        nodeVersion: {
            type: String,
            default: "20"
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
        ENVIRONMENT
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


        /*
        ==========================================
        BILLING / WALLET CONTROL
        ==========================================
        */

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
        DEPLOYMENT INFORMATION
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
        DOMAIN
        ==========================================
        */

        domain: {
            type: String,
            default: ""
        },

        sslEnabled: {
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

projectSchema.index({
    user: 1,
    createdAt: -1
});

projectSchema.index({
    status: 1
});


module.exports = mongoose.model(
    "Project",
    projectSchema
);
