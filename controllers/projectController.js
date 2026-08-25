// backend/controllers/projectController.js

const Project = require("../models/Project");

// =====================================================
// CREATE PROJECT
// POST /api/projects
// =====================================================

async function createProject(req, res) {
    try {
        const {
            name,
            description,
            repository,
            branch,
            framework
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Project name is required"
            });
        }

        const project = await Project.create({
            user: req.user.id,
            name: name.trim(),
            description: description || "",
            repository: repository || "",
            branch: branch || "main",
            framework: framework || "node",
            status: "stopped"
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            project
        });

    } catch (error) {
        console.error("CREATE PROJECT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create project"
        });
    }
}


// =====================================================
// GET ALL PROJECTS
// GET /api/projects
// =====================================================

async function getProjects(req, res) {
    try {
        const projects = await Project.find({
            user: req.user.id
        }).sort({
            createdAt: -1
        });

        return res.json({
            success: true,
            projects
        });

    } catch (error) {
        console.error("GET PROJECTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load projects"
        });
    }
}


// =====================================================
// GET SINGLE PROJECT
// GET /api/projects/:id
// =====================================================

async function getProject(req, res) {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.json({
            success: true,
            project
        });

    } catch (error) {
        console.error("GET PROJECT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load project"
        });
    }
}


// =====================================================
// UPDATE PROJECT
// PUT /api/projects/:id
// =====================================================

async function updateProject(req, res) {
    try {
        const allowedFields = [
            "name",
            "description",
            "repository",
            "branch",
            "framework"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const project = await Project.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.json({
            success: true,
            message: "Project updated successfully",
            project
        });

    } catch (error) {
        console.error("UPDATE PROJECT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update project"
        });
    }
}


// =====================================================
// DELETE PROJECT
// DELETE /api/projects/:id
// =====================================================

async function deleteProject(req, res) {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.json({
            success: true,
            message: "Project deleted successfully"
        });

    } catch (error) {
        console.error("DELETE PROJECT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete project"
        });
    }
}


// =====================================================
// PROJECT STATUS
// PATCH /api/projects/:id/status
// =====================================================

async function updateStatus(req, res) {
    try {
        const allowedStatuses = [
            "running",
            "stopped",
            "building",
            "failed"
        ];

        const { status } = req.body;

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project status"
            });
        }

        const project = await Project.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            {
                status
            },
            {
                new: true
            }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.json({
            success: true,
            message: "Project status updated",
            project
        });

    } catch (error) {
        console.error("STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update project status"
        });
    }
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    updateStatus
};
