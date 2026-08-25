// backend/controllers/deploymentController.js

const Deployment = require("../models/Deployment");
const Project = require("../models/Project");
const Bot = require("../models/Bot");

// =====================================================
// CREATE DEPLOYMENT
// POST /api/deployments
// =====================================================

async function createDeployment(req, res) {
    try {
        const {
            projectId,
            botId,
            branch
        } = req.body;

        if (!projectId && !botId) {
            return res.status(400).json({
                success: false,
                message: "Project or bot is required"
            });
        }

        let resource;

        if (projectId) {
            resource = await Project.findOne({
                _id: projectId,
                user: req.user.id
            });
        } else {
            resource = await Bot.findOne({
                _id: botId,
                user: req.user.id
            });
        }

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Project or bot not found"
            });
        }

        const deployment = await Deployment.create({
            user: req.user.id,
            project: projectId || null,
            bot: botId || null,
            branch:
                branch ||
                resource.branch ||
                "main",
            status: "queued",
            trigger: "manual"
        });

        return res.status(201).json({
            success: true,
            message: "Deployment queued successfully",
            deployment
        });

    } catch (error) {
        console.error(
            "CREATE DEPLOYMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to create deployment"
        });
    }
}


// =====================================================
// GET DEPLOYMENTS
// GET /api/deployments
// =====================================================

async function getDeployments(req, res) {
    try {
        const deployments =
            await Deployment.find({
                user: req.user.id
            })
            .populate("project", "name")
            .populate("bot", "name type")
            .sort({
                createdAt: -1
            })
            .limit(100);

        return res.json({
            success: true,
            deployments
        });

    } catch (error) {
        console.error(
            "GET DEPLOYMENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load deployments"
        });
    }
}


// =====================================================
// GET SINGLE DEPLOYMENT
// GET /api/deployments/:id
// =====================================================

async function getDeployment(req, res) {
    try {
        const deployment =
            await Deployment.findOne({
                _id: req.params.id,
                user: req.user.id
            })
            .populate("project", "name repository")
            .populate("bot", "name type repository");

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found"
            });
        }

        return res.json({
            success: true,
            deployment
        });

    } catch (error) {
        console.error(
            "GET DEPLOYMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load deployment"
        });
    }
}


// =====================================================
// UPDATE DEPLOYMENT STATUS
// PATCH /api/deployments/:id/status
// =====================================================

async function updateDeploymentStatus(req, res) {
    try {
        const {
            status,
            message,
            logs
        } = req.body;

        const allowedStatuses = [
            "queued",
            "building",
            "deploying",
            "running",
            "failed",
            "cancelled",
            "stopped"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid deployment status"
            });
        }

        const deployment =
            await Deployment.findOne({
                _id: req.params.id,
                user: req.user.id
            });

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found"
            });
        }

        deployment.status = status;

        if (message !== undefined) {
            deployment.message = message;
        }

        if (logs !== undefined) {
            deployment.logs = logs;
        }

        if (
            status === "running" ||
            status === "failed" ||
            status === "cancelled" ||
            status === "stopped"
        ) {
            deployment.finishedAt = new Date();
        }

        await deployment.save();

        return res.json({
            success: true,
            message: "Deployment status updated",
            deployment
        });

    } catch (error) {
        console.error(
            "UPDATE DEPLOYMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update deployment"
        });
    }
}


// =====================================================
// CANCEL DEPLOYMENT
// POST /api/deployments/:id/cancel
// =====================================================

async function cancelDeployment(req, res) {
    try {
        const deployment =
            await Deployment.findOne({
                _id: req.params.id,
                user: req.user.id
            });

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found"
            });
        }

        const finishedStatuses = [
            "running",
            "failed",
            "cancelled",
            "stopped"
        ];

        if (
            finishedStatuses.includes(
                deployment.status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Deployment can no longer be cancelled"
            });
        }

        deployment.status = "cancelled";
        deployment.finishedAt = new Date();

        await deployment.save();

        return res.json({
            success: true,
            message: "Deployment cancelled",
            deployment
        });

    } catch (error) {
        console.error(
            "CANCEL DEPLOYMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to cancel deployment"
        });
    }
}


// =====================================================
// DEPLOYMENT LOGS
// GET /api/deployments/:id/logs
// =====================================================

async function getDeploymentLogs(req, res) {
    try {
        const deployment =
            await Deployment.findOne({
                _id: req.params.id,
                user: req.user.id
            }).select(
                "status logs createdAt finishedAt"
            );

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found"
            });
        }

        return res.json({
            success: true,
            deployment: {
                id: deployment._id,
                status: deployment.status,
                logs: deployment.logs || [],
                createdAt: deployment.createdAt,
                finishedAt:
                    deployment.finishedAt || null
            }
        });

    } catch (error) {
        console.error(
            "DEPLOYMENT LOGS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load deployment logs"
        });
    }
}


// =====================================================
// DELETE DEPLOYMENT RECORD
// DELETE /api/deployments/:id
// =====================================================

async function deleteDeployment(req, res) {
    try {
        const deployment =
            await Deployment.findOneAndDelete({
                _id: req.params.id,
                user: req.user.id
            });

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found"
            });
        }

        return res.json({
            success: true,
            message:
                "Deployment record deleted"
        });

    } catch (error) {
        console.error(
            "DELETE DEPLOYMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete deployment"
        });
    }
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createDeployment,
    getDeployments,
    getDeployment,
    updateDeploymentStatus,
    cancelDeployment,
    getDeploymentLogs,
    deleteDeployment
};
