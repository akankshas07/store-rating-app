
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// ===============================
// GET ALL USERS — ADMIN
// ===============================
const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, address, role FROM users ORDER BY name ASC"
        );

        res.status(200).json({
            users: result.rows
        });

    } catch (error) {
        console.error("Get all users error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// ===============================
// CHANGE PASSWORD
// ===============================
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Old password and new password are required"
            });
        }

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message:
                    "New password must be 8-16 characters long and contain at least one uppercase letter and one special character"
            });
        }

        const result = await pool.query(
            "SELECT password FROM users WHERE id = $1",
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            oldPassword,
            result.rows[0].password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Old password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2",
            [hashedPassword, req.user.id]
        );

        res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getAllUsers,
    changePassword
};
