const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("USER"),
    async (req, res) => {
        try {
            const { storeId, rating } = req.body;

            if (!storeId || !rating) {
                return res.status(400).json({
                    message: "Store ID and rating are required"
                });
            }

            if (
                !Number.isInteger(Number(rating)) ||
                Number(rating) < 1 ||
                Number(rating) > 5
            ) {
                return res.status(400).json({
                    message: "Rating must be an integer between 1 and 5"
                });
            }

            const pool = require("../config/db");

            const store = await pool.query(
                "SELECT id FROM stores WHERE id = $1",
                [storeId]
            );

            if (store.rows.length === 0) {
                return res.status(404).json({
                    message: "Store not found"
                });
            }

            const existing = await pool.query(
                `SELECT id
                 FROM ratings
                 WHERE user_id = $1
                 AND store_id = $2`,
                [req.user.id, storeId]
            );

            if (existing.rows.length > 0) {
                await pool.query(
                    `UPDATE ratings
                     SET rating = $1
                     WHERE user_id = $2
                     AND store_id = $3`,
                    [rating, req.user.id, storeId]
                );

                return res.json({
                    message: "Rating updated successfully"
                });
            }

            await pool.query(
                `INSERT INTO ratings (user_id, store_id, rating)
                 VALUES ($1, $2, $3)`,
                [req.user.id, storeId, rating]
            );

            res.status(201).json({
                message: "Rating submitted successfully"
            });

        } catch (error) {
            console.error("Rating error:", error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

module.exports = router;