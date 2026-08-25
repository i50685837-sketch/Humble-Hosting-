const express = require("express");
const router = express.Router();

const {
    createBot,
    getBots,
    getBot,
    updateBot,
    deleteBot,
    deployBot,
    startBot,
    stopBot,
    restartBot,
    getBotLogs
} = require("../controllers/botController");

const authMiddleware = require("../middleware/authMiddleware");


/*
==================================================
AUTHENTICATION
==================================================
*/

router.use(authMiddleware);


/*
==================================================
BOTS
==================================================
*/

// Create bot
// POST /api/bots
router.post("/", createBot);


// Get all user's bots
// GET /api/bots
router.get("/", getBots);


// Get single bot
// GET /api/bots/:id
router.get("/:id", getBot);


/*
==================================================
UPDATE / DELETE
==================================================
*/

// Update bot
// PUT /api/bots/:id
router.put("/:id", updateBot);


// Delete bot
// DELETE /api/bots/:id
router.delete("/:id", deleteBot);


/*
==================================================
DEPLOYMENT
==================================================
*/

// Deploy bot
// POST /api/bots/:id/deploy
router.post("/:id/deploy", deployBot);


/*
==================================================
BOT CONTROLS
==================================================
*/

// Start bot
// POST /api/bots/:id/start
router.post("/:id/start", startBot);


// Stop bot
// POST /api/bots/:id/stop
router.post("/:id/stop", stopBot);


// Restart bot
// POST /api/bots/:id/restart
router.post("/:id/restart", restartBot);


/*
==================================================
LOGS
==================================================
*/

// Get bot logs
// GET /api/bots/:id/logs
router.get("/:id/logs", getBotLogs);


module.exports = router;
