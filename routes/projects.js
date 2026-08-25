const express = require("express");
const router = express.Router();

const {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    deployProject,
    stopProject,
    restartProject
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");


/*
==================================================
AUTHENTICATION
==================================================
*/

router.use(authMiddleware);


/*
==================================================
PROJECTS
==================================================
*/

// Create project
// POST /api/projects
router.post("/", createProject);


// Get all user's projects
// GET /api/projects
router.get("/", getProjects);


// Get one project
// GET /api/projects/:id
router.get("/:id", getProject);


/*
==================================================
UPDATE / DELETE
==================================================
*/

// Update project
// PUT /api/projects/:id
router.put("/:id", updateProject);


// Delete project
// DELETE /api/projects/:id
router.delete("/:id", deleteProject);


/*
==================================================
PROJECT CONTROLS
==================================================
*/

// Deploy project
// POST /api/projects/:id/deploy
router.post("/:id/deploy", deployProject);


// Stop project
// POST /api/projects/:id/stop
router.post("/:id/stop", stopProject);


// Restart project
// POST /api/projects/:id/restart
router.post("/:id/restart", restartProject);


module.exports = router;
