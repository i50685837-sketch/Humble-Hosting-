const mongoose = require("mongoose");

const deploymentSchema = new mongoose.Schema(
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
        PROJECT / BOT
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
        DEPLOYMENT TYPE
        ==========================================
        */

        type: {
            type: String,
            enum: [
                "project",
                "bot"
            ],
            required: true
        },


        /*
        ==========================================
        SOURCE
        ==========================================
        */

        source: {
            type: String,
            enum: [
                "github",
                "upload",
                "manual"
            ],
            default: "github"
        },

        repository: {
            type: String,
            default: ""
        },

        branch: {
            type: String,
            default: "main"
        },

        commitId: {
            type: String,
            default: ""
        },

        commitMessage: {
            type: String,
            default: ""
        },


        /*
        ==========================================
        DEPLOYMENT STATUS
        ==========================================
        */

        status: {
            type: String,
            enum: [
                "queued",
                "building",
                "deploying",
                "running",
                "success",
                "failed",
                "cancelled"
            ],
            default: "queued",
            index: true
        },


        /*
        ==========================================
        BUILD
        ==========================================
        */

        buildCommand: {
            type: String,
            default: "npm install"
        },

        startCommand: {
            type: String,
            default: "npm start"
        },

        nodeVersion: {
            type: String,
            default: "20"
        },


        /*
        ==========================================
        SERVER
        ==========================================
        */

        serverId: {
            type: String,
            default: ""
        },

        containerId: {
            type: String,
            default: ""
        },

        deploymentUrl: {
            type: String,
            default: ""
        },


        /*
        ==========================================
        LOGS
        ==========================================
        */

        buildLogs: {
            type: String,
            default: ""
        },

        runtimeLogs: {
            type: String,
            default: ""
        },

        errorMessage: {
            type: String,
            default: ""
        },


        /*
        ==========================================
        RESOURCE USAGE
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


        /*
        ==========================================
        TIMING
        ==========================================
        */

        queuedAt: {
            type: Date,
            default: Date.now
        },

        startedAt: {
            type: Date,
            default: null
        },

        completedAt: {
            type: Date,
            default: null
        },

        duration: {
            type: Number,
            default: 0
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

deploymentSchema.index({
    user: 1,
    createdAt: -1
});

deploymentSchema.index({
    project: 1,
    createdAt: -1
});

deploymentSchema.index({
    bot: 1,
    createdAt: -1
});

deploymentSchema.index({
    status: 1,
    createdAt: -1
});


/*
==================================================
CALCULATE DEPLOYMENT DURATION
==================================================
*/

deploymentSchema.pre("save", function(next) {

    if (
        this.startedAt &&
        this.completedAt
    ) {

        this.duration =
            this.completedAt.getTime() -
            this.startedAt.getTime();

    }

    next();
});


module.exports = mongoose.model(
    "Deployment",
    deploymentSchema
);
