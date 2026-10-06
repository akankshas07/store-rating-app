const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getAllStores,
    addStore
} = require("../controllers/storeController");

const router = express.Router();

// ===============================
// GET ALL STORES — USER
// ===============================
router.get(
    "/",
    authMiddleware,
    roleMiddleware("USER","ADMIN"),
    getAllStores
);

// ===============================
// ADD STORE — ADMIN
// ===============================
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    addStore
);

module.exports = router;