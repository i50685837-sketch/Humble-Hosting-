// backend/controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// =====================================================
// CREATE JWT
// =====================================================

function createToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

async function register(req, res) {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            provider: "email"
        });

        const token = createToken(user);

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create account"
        });
    }
}

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

async function login(req, res) {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email: normalizedEmail
            }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message:
                    "This account uses social login. Please continue with Google or GitHub."
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = createToken(user);

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to login"
        });
    }
}

// =====================================================
// CURRENT USER
// GET /api/auth/me
// =====================================================

async function me(req, res) {
    try {
        const user =
            await User.findById(req.user.id)
                .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error("ME ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load account"
        });
    }
}

// =====================================================
// LOGOUT
// =====================================================

async function logout(req, res) {
    // JWT is normally removed by the frontend.
    // This endpoint exists for a clean API structure.

    return res.json({
        success: true,
        message: "Logged out successfully"
    });
}

// =====================================================
// GOOGLE LOGIN
// =====================================================

function googleLogin(req, res) {
    return res.status(501).json({
        success: false,
        message: "Google OAuth is not configured yet"
    });
}

// =====================================================
// GITHUB LOGIN
// =====================================================

function githubLogin(req, res) {
    return res.status(501).json({
        success: false,
        message: "GitHub OAuth is not configured yet"
    });
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    register,
    login,
    me,
    logout,
    googleLogin,
    githubLogin
};
