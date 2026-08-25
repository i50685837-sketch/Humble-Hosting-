const Project = require("../models/Project");
const Bot = require("../models/Bot");

/*
==================================================
GET MONITORING OVERVIEW
==================================================
*/
exports.getOverview = async (req, res) => {
    try {
        const userId = req.user.id;

        const [projects, bots] = await Promise.all([
            Project.find({ user: userId }),
            Bot.find({ user: userId })
        ]);

        const activeProjects = projects.filter(
            project => project.status === "running" ||
                       project.status === "live"
        ).length;

        const runningBots = bots.filter(
            bot => bot.status === "running" ||
                   bot.status === "online"
        ).length;

        res.json({
            success: true,

            monitoring: {
                projects: {
                    total: projects.length,
                    active: activeProjects
                },

                bots: {
                    total: bots.length,
                    running: runningBots
                },

                system: {
                    cpu: 0,
                    memory: 0,
                    storage: 0,
                    network: 0,
                    uptime: 0
                }
            }
        });

    } catch (error) {
        console.error("Monitoring overview error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load monitoring data"
        });
    }
};


/*
==================================================
GET PROJECT MONITORING
==================================================
*/
exports.getProjectMonitoring = async (req, res) => {
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

        res.json({
            success: true,

            project: {
                id: project._id,
                name: project.name,
                status: project.status,

                metrics: {
                    cpu: project.cpuUsage || 0,
                    memory: project.memoryUsage || 0,
                    storage: project.storageUsage || 0,
                    network: project.networkUsage || 0,
                    uptime: project.uptime || 0
                }
            }
        });

    } catch (error) {
        console.error("Project monitoring error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load project monitoring"
        });
    }
};


/*
==================================================
GET BOT MONITORING
==================================================
*/
exports.getBotMonitoring = async (req, res) => {
    try {
        const bot = await Bot.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!bot) {
            return res.status(404).json({
                success: false,
                message: "Bot not found"
            });
        }

        res.json({
            success: true,

            bot: {
                id: bot._id,
                name: bot.name,
                platform: bot.platform,
                status: bot.status,

                metrics: {
                    cpu: bot.cpuUsage || 0,
                    memory: bot.memoryUsage || 0,
                    network: bot.networkUsage || 0,
                    uptime: bot.uptime || 0
                }
            }
        });

    } catch (error) {
        console.error("Bot monitoring error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load bot monitoring"
        });
    }
};


/*
==================================================
GET CPU
==================================================
*/
exports.getCPU = async (req, res) => {
    try {
        res.json({
            success: true,
            metric: "cpu",
            value: 0,
            unit: "%"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load CPU usage"
        });
    }
};


/*
==================================================
GET MEMORY / RAM
==================================================
*/
exports.getRAM = async (req, res) => {
    try {
        res.json({
            success: true,
            metric: "memory",
            value: 0,
            unit: "%"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load RAM usage"
        });
    }
};


/*
==================================================
GET STORAGE
==================================================
*/
exports.getStorage = async (req, res) => {
    try {
        res.json({
            success: true,
            metric: "storage",
            value: 0,
            unit: "%"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load storage usage"
        });
    }
};


/*
==================================================
GET NETWORK
==================================================
*/
exports.getNetwork = async (req, res) => {
    try {
        res.json({
            success: true,
            metric: "network",
            value: 0,
            unit: "MB/s"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load network usage"
        });
    }
};


/*
==================================================
GET UPTIME
==================================================
*/
exports.getUptime = async (req, res) => {
    try {
        res.json({
            success: true,
            metric: "uptime",
            value: 0,
            unit: "seconds"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load uptime"
        });
    }
};
