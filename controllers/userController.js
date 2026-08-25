const User = require("../models/User");

/*
==================================================
GET CURRENT USER
==================================================
*/
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load user"
        });
    }
};


/*
==================================================
UPDATE PROFILE
==================================================
*/
exports.updateProfile = async (req, res) => {
    try {
        const { name, username } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name !== undefined) {
            user.name = name.trim();
        }

        if (username !== undefined) {
            user.username = username.trim().toLowerCase();
        }

        await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Update profile error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};


/*
==================================================
UPDATE EMAIL
==================================================
*/
exports.updateEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: cleanEmail,
            _id: { $ne: req.user.id }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already in use"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.email = cleanEmail;

        // Require verification after changing email.
        user.emailVerified = false;

        await user.save();

        res.json({
            success: true,
            message: "Email updated. Please verify your new email.",
            email: user.email
        });

    } catch (error) {
        console.error("Update email error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update email"
        });
    }
};


/*
==================================================
UPDATE AVATAR
==================================================
*/
exports.updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({
                success: false,
                message: "Avatar is required"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.avatar = avatar;

        await user.save();

        res.json({
            success: true,
            message: "Avatar updated successfully",
            avatar: user.avatar
        });

    } catch (error) {
        console.error("Avatar update error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update avatar"
        });
    }
};


/*
==================================================
GET USER DASHBOARD SUMMARY
==================================================
*/
exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            dashboard: {
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    emailVerified: user.emailVerified
                },

                walletBalance: user.walletBalance || 0,

                plan: user.plan || "None"
            }
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard"
        });
    }
};


/*
==================================================
DELETE ACCOUNT
==================================================
*/
exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.user.id);

        res.json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Delete account error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete account"
        });
    }
};
