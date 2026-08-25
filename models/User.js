const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        /*
        ==========================================
        BASIC ACCOUNT
        ==========================================
        */

        name: {
            type: String,
            trim: true,
            maxlength: 100
        },

        username: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true,
            maxlength: 50
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            select: false
        },


        /*
        ==========================================
        PROFILE
        ==========================================
        */

        avatar: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: "",
            maxlength: 500
        },


        /*
        ==========================================
        AUTHENTICATION
        ==========================================
        */

        emailVerified: {
            type: Boolean,
            default: false
        },

        provider: {
            type: String,
            enum: [
                "email",
                "google",
                "github"
            ],
            default: "email"
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true
        },

        githubId: {
            type: String,
            unique: true,
            sparse: true
        },


        /*
        ==========================================
        WALLET
        ==========================================
        */

        walletBalance: {
            type: Number,
            default: 0,
            min: 0
        },


        /*
        ==========================================
        HOSTING PLAN
        ==========================================
        */

        plan: {
            type: String,
            enum: [
                "None",
                "Free",
                "Basic",
                "Pro",
                "Business"
            ],
            default: "None"
        },

        planExpiresAt: {
            type: Date,
            default: null
        },


        /*
        ==========================================
        ACCOUNT STATUS
        ==========================================
        */

        status: {
            type: String,
            enum: [
                "active",
                "suspended",
                "banned"
            ],
            default: "active"
        },

        role: {
            type: String,
            enum: [
                "user",
                "admin"
            ],
            default: "user"
        },


        /*
        ==========================================
        SECURITY
        ==========================================
        */

        lastLogin: {
            type: Date,
            default: null
        },

        lastLoginIP: {
            type: String,
            default: null
        },

        loginAttempts: {
            type: Number,
            default: 0
        },

        lockedUntil: {
            type: Date,
            default: null
        },


        /*
        ==========================================
        API
        ==========================================
        */

        apiKey: {
            type: String,
            default: null
        },

        apiKeyCreatedAt: {
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
HIDE SENSITIVE DATA WHEN RETURNING USER
==================================================
*/

userSchema.methods.toJSON = function () {
    const user = this.toObject();

    delete user.password;
    delete user.loginAttempts;
    delete user.lockedUntil;
    delete user.lastLoginIP;

    return user;
};


module.exports = mongoose.model("User", userSchema);
