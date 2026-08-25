const Domain = require("../models/Domain");

/*
==================================================
GET ALL DOMAINS
==================================================
*/
exports.getDomains = async (req, res) => {
    try {
        const domains = await Domain.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            domains
        });

    } catch (error) {
        console.error("Get domains error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load domains"
        });
    }
};


/*
==================================================
GET SINGLE DOMAIN
==================================================
*/
exports.getDomain = async (req, res) => {
    try {
        const domain = await Domain.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!domain) {
            return res.status(404).json({
                success: false,
                message: "Domain not found"
            });
        }

        res.json({
            success: true,
            domain
        });

    } catch (error) {
        console.error("Get domain error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load domain"
        });
    }
};


/*
==================================================
ADD DOMAIN
==================================================
*/
exports.addDomain = async (req, res) => {
    try {
        const { domain } = req.body;

        if (!domain) {
            return res.status(400).json({
                success: false,
                message: "Domain name is required"
            });
        }

        const cleanDomain = domain
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .replace(/\/$/, "");

        const existing = await Domain.findOne({
            domain: cleanDomain
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Domain is already registered"
            });
        }

        const newDomain = await Domain.create({
            user: req.user.id,
            domain: cleanDomain,
            status: "pending",
            ssl: false
        });

        res.status(201).json({
            success: true,
            message: "Domain added successfully",
            domain: newDomain
        });

    } catch (error) {
        console.error("Add domain error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add domain"
        });
    }
};


/*
==================================================
VERIFY DOMAIN
==================================================
*/
exports.verifyDomain = async (req, res) => {
    try {
        const domain = await Domain.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!domain) {
            return res.status(404).json({
                success: false,
                message: "Domain not found"
            });
        }

        /*
         * DNS verification service can be connected here.
         * For now we mark the request as checking.
         */

        domain.status = "checking";

        await domain.save();

        res.json({
            success: true,
            message: "Domain verification started",
            domain
        });

    } catch (error) {
        console.error("Verify domain error:", error);

        res.status(500).json({
            success: false,
            message: "Domain verification failed"
        });
    }
};


/*
==================================================
ENABLE SSL
==================================================
*/
exports.enableSSL = async (req, res) => {
    try {
        const domain = await Domain.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!domain) {
            return res.status(404).json({
                success: false,
                message: "Domain not found"
            });
        }

        if (domain.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Verify the domain before enabling SSL"
            });
        }

        domain.ssl = true;

        await domain.save();

        res.json({
            success: true,
            message: "SSL activation requested",
            domain
        });

    } catch (error) {
        console.error("SSL error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to enable SSL"
        });
    }
};


/*
==================================================
DELETE DOMAIN
==================================================
*/
exports.deleteDomain = async (req, res) => {
    try {
        const domain = await Domain.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!domain) {
            return res.status(404).json({
                success: false,
                message: "Domain not found"
            });
        }

        res.json({
            success: true,
            message: "Domain deleted successfully"
        });

    } catch (error) {
        console.error("Delete domain error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete domain"
        });
    }
};
