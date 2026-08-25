const express = require("express");
const router = express.Router();

const {
    createDomain,
    getDomains,
    getDomain,
    updateDomain,
    deleteDomain,
    verifyDomain,
    connectDomain,
    enableSSL,
    getDNSRecords,
    updateDNSRecords
} = require("../controllers/domainController");

const authMiddleware = require("../middleware/authMiddleware");


/*
==================================================
AUTHENTICATION
==================================================
*/

router.use(authMiddleware);


/*
==================================================
DOMAINS
==================================================
*/

// Add a domain
// POST /api/domains
router.post("/", createDomain);


// Get user's domains
// GET /api/domains
router.get("/", getDomains);


// Get one domain
// GET /api/domains/:id
router.get("/:id", getDomain);


/*
==================================================
DOMAIN MANAGEMENT
==================================================
*/

// Update domain
// PUT /api/domains/:id
router.put("/:id", updateDomain);


// Delete domain
// DELETE /api/domains/:id
router.delete("/:id", deleteDomain);


/*
==================================================
DOMAIN VERIFICATION
==================================================
*/

// Verify DNS configuration
// POST /api/domains/:id/verify
router.post("/:id/verify", verifyDomain);


// Connect domain to project/bot
// POST /api/domains/:id/connect
router.post("/:id/connect", connectDomain);


/*
==================================================
DNS
==================================================
*/

// Get DNS records
// GET /api/domains/:id/dns
router.get("/:id/dns", getDNSRecords);


// Update DNS records
// PUT /api/domains/:id/dns
router.put("/:id/dns", updateDNSRecords);


/*
==================================================
SSL
==================================================
*/

// Enable/request SSL
// POST /api/domains/:id/ssl
router.post("/:id/ssl", enableSSL);


module.exports = router;
