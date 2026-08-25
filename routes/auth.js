const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getMe,
    logout
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");


/*
==================================================
PUBLIC ROUTES
==================================================
*/

// Email registration
router.post("/register", register);

// Email login
router.post("/login", login);


/*
==================================================
PROTECTED ROUTES
==================================================
*/

// Current logged-in user
router.get("/me", authMiddleware, getMe);

// Logout
router.post("/logout", authMiddleware, logout);


module.exports = router;
