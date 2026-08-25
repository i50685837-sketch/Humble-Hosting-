const express = require("express");
const router = express.Router();

const {
    getOverview,
    getProjectMonitoring,
    getBotMonitoring
} = require("../controllers/monitoringController");

const authMiddleware = require("../middleware/authMiddleware");


/*
==================================================
AUTHENTICATION
==================================================
*/

router.use(authMiddleware);


/*
==================================================
MONITORING OVERVIEW
==================================================
*/

// GET /api/monitoring
router.get("/", getOverview);


/*
==================================================
PROJECT MONITORING
==================================================
*/

// GET /api/monitoring/project/:id
router.get(
    "/project/:id",
    getProjectMonitoring
);


/*
==================================================
BOT MONITORING
==================================================
*/

// GET /api/monitoring/bot/:id
router.get(
    "/bot/:id",
    getBotMonitoring
);


module.exports = router;
