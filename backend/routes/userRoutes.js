const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { changePassword } = require("../controllers/userController");

const router = express.Router();

// Test protected USER route
router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("USER"),
    (req, res) => {
        res.json({
            message: "User profile access granted",
            user: req.user
        });
    }
);

// Change password
router.put(
    "/change-password",
    authMiddleware,
    roleMiddleware("USER"),
    changePassword
);

module.exports = router;