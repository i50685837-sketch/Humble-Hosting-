// backend/controllers/botController.js

const Bot = require("../models/Bot");

// =====================================================
// CREATE BOT
// POST /api/bots
// =====================================================

async function createBot(req, res) {
    try {
        const {
            name,
            type,
            repository,
            branch,
            framework,
            startCommand
        } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: "Bot name and bot type are required"
            });
        }

        const allowedTypes = [
            "whatsapp",
            "telegram",
            "discord"
        ];

        if (!allowedTypes.includes(type.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message:
                    "Bot type must be WhatsApp, Telegram or Discord"
            });
        }

        const bot = await Bot.create({
            user: req.user.id,
            name: name.trim(),
            type: type.toLowerCase(),
            repository: repository || "",
            branch: branch || "main",
            framework: framework || "node",
            startCommand: startCommand || "npm start",
            status: "stopped"
        });

        return res.status(201).json({
            success: true,
            message: "Bot created successfully",
            bot
        });

    } catch (error) {
        console.error("CREATE BOT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create bot"
        });
    }
}


// =====================================================
// GET ALL BOTS
// GET /api/bots
// =====================================================

async function getBots(req, res) {
    try {
        const bots = await Bot.find({
            user: req.user.id
        }).sort({
            createdAt: -1
        });

        return res.json({
            success: true,
            bots
        });

    } catch (error) {
        console.error("GET BOTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load bots"
        });
    }
}


// =====================================================
// GET SINGLE BOT
// GET /api/bots/:id
// =====================================================

async function getBot(req, res) {
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

        return res.json({
            success: true,
            bot
        });

    } catch (error) {
        console.error("GET BOT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load bot"
        });
    }
}


// =====================================================
// UPDATE BOT
// PUT /api/bots/:id
// =====================================================

async function updateBot(req, res) {
    try {
        const allowedFields = [
            "name",
            "repository",
            "branch",
            "framework",
            "startCommand"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const bot = await Bot.findOneAndUpdate(
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

        if (!bot) {
            return res.status(404).json({
                success: false,
                message: "Bot not found"
            });
        }

        return res.json({
            success: true,
            message: "Bot updated successfully",
            bot
        });

    } catch (error) {
        console.error("UPDATE BOT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update bot"
        });
    }
}


// =====================================================
// DELETE BOT
// DELETE /api/bots/:id
// =====================================================

async function deleteBot(req, res) {
    try {
        const bot = await Bot.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!bot) {
            return res.status(404).json({
                success: false,
                message: "Bot not found"
            });
        }

        return res.json({
            success: true,
            message: "Bot deleted successfully"
        });

    } catch (error) {
        console.error("DELETE BOT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete bot"
        });
    }
}


// =====================================================
// START BOT
// POST /api/bots/:id/start
// =====================================================

async function startBot(req, res) {
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

        if (Number(bot.price || 0) > 0) {
            // IMPORTANT:
            // The actual wallet check/payment deduction
            // should happen in a service using an atomic
            // database transaction.
        }

        if (bot.status === "running") {
            return res.status(400).json({
                success: false,
                message: "Bot is already running"
            });
        }

        bot.status = "starting";

        await bot.save();

        /*
         * The actual process/container should be started
         * by botService/deploymentService.
         */

        return res.json({
            success: true,
            message: "Bot start requested",
            bot
        });

    } catch (error) {
        console.error("START BOT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to start bot"
        });
    }
}


// =====================================================
// STOP BOT
// POST /api/bots/:id/stop
// =====================================================

async function stopBot(req, res) {
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

        bot.status = "stopping";

        await bot.save();

        /*
         * Actual process termination belongs in the
         * hosting/runtime service.
         */

        return res.json({
            success: true,
            message: "Bot stop requested",
            bot
        });

    } catch (error) {
        console.error("STOP BOT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to stop bot"
        });
    }
}


// =====================================================
// RESTART BOT
// POST /api/bots/:id/restart
// =====================================================

async function restartBot(req, res) {
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

        bot.status = "restarting";

        await bot.save();

        return res.json({
            success: true,
            message: "Bot restart requested",
            bot
        });

    } catch (error) {
        console.error("RESTART BOT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to restart bot"
        });
    }
}


// =====================================================
// BOT STATUS
// GET /api/bots/:id/status
// =====================================================

async function getBotStatus(req, res) {
    try {
        const bot = await Bot.findOne({
            _id: req.params.id,
            user: req.user.id
        }).select(
            "name type status uptime cpu memory createdAt"
        );

        if (!bot) {
            return res.status(404).json({
                success: false,
                message: "Bot not found"
            });
        }

        return res.json({
            success: true,
            status: bot
        });

    } catch (error) {
        console.error("BOT STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to get bot status"
        });
    }
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createBot,
    getBots,
    getBot,
    updateBot,
    deleteBot,
    startBot,
    stopBot,
    restartBot,
    getBotStatus
};
