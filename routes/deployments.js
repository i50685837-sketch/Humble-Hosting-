const express = require("express");
const router = express.Router();

const {
    getDeployments,
    getDeployment,
    createDeployment,
    cancelDeployment,
    redeploy,
    getBuildLogs,
    getRuntimeLogs
} = require("../controllers/deploymentController");

const authMiddleware = require("../middleware/authMiddleware");


/*
==================================================
AUTHENTICATION
==================================================
*/

router.use(authMiddleware);


/*
==================================================
DEPLOYMENTS
==================================================
*/

// Get user's deployment history
// GET /api/deployments
router.get("/", getDeployments);


// Get one deployment
// GET /api/deployments/:id
router.get("/:id", getDeployment);


/*
==================================================
CREATE DEPLOYMENT
==================================================
*/

// Create deployment
// POST /api/deployments
router.post("/", createDeployment);


/*
==================================================
DEPLOYMENT CONTROLS
==================================================
*/

// Cancel deployment
// POST /api/deployments/:id/cancel
router.post("/:id/cancel", cancelDeployment);


// Redeploy
// POST /api/deployments/:id/redeploy
router.post("/:id/redeploy", redeploy);


/*
==================================================
LOGS
==================================================
*/

// Build logs
// GET /api/deployments/:id/build-logs
router.get("/:id/build-logs", getBuildLogs);


// Runtime logs
// GET /api/deployments/:id/runtime-logs
router.get("/:id/runtime-logs", getRuntimeLogs);


module.exports = router;
