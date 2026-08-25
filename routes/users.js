const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");


/*
==================================================
AUTHENTICATION
==================================================
*/

router.use(authMiddleware);


/*
==================================================
PROFILE
==================================================
*/

// Get current user profile
// GET /api/users/profile
router.get("/profile", getProfile);


// Update profile
// PUT /api/users/profile
router.put("/profile", updateProfile);


/*
==================================================
SECURITY
==================================================
*/

// Change password
// PUT /api/users/password
router.put("/password", changePassword);


/*
==================================================
ACCOUNT
==================================================
*/

// Delete account
// DELETE /api/users/account
router.delete("/account", deleteAccount);


module.exports = router;
