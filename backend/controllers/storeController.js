const pool = require("../config/db");

// GET ALL STORES
const getAllStores = async (req, res) => {
    try {
        const { name, address } = req.query;

        let query = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(ROUND(AVG(r.rating), 2), 0) AS overall_rating
            FROM stores s
            LEFT JOIN ratings r
                ON s.id = r.store_id
        `;

        const conditions = [];
        const values = [];

        // Search by store name
        if (name) {
            values.push(`%${name}%`);
            conditions.push(`s.name ILIKE $${values.length}`);
        }

        // Search by address
        if (address) {
            values.push(`%${address}%`);
            conditions.push(`s.address ILIKE $${values.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += `
            GROUP BY s.id
            ORDER BY s.name ASC
        `;

        const result = await pool.query(query, values);

        res.status(200).json({
            stores: result.rows
        });

    } catch (error) {
        console.error("Get stores error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ADD STORE — ADMIN
const addStore = async (req, res) => {
    try {
        const { name, email, address, ownerId } = req.body;

        // DEBUG
        console.log("STORE NAME:", name);
        console.log(
            "STORE NAME LENGTH:",
            name ? name.length : "undefined"
        );
        console.log("STORE EMAIL:", email);

        // Required fields
        if (!name || !email || !address) {
            return res.status(400).json({
                message: "Name, email and address are required"
            });
        }

        // Name validation
        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                message: "Store name must be between 20 and 60 characters"
            });
        }

        // Address validation
        if (address.length > 400) {
            return res.status(400).json({
                message: "Address must not exceed 400 characters"
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        // Check duplicate store email
        const existingStore = await pool.query(
            "SELECT id FROM stores WHERE email = $1",
            [email]
        );

        console.log("EXISTING STORE:", existingStore.rows);

        if (existingStore.rows.length > 0) {
            return res.status(400).json({
                message: "Store email already exists"
            });
        }

        // Verify owner if ownerId is provided
        if (ownerId) {
            const owner = await pool.query(
                "SELECT id, role FROM users WHERE id = $1",
                [ownerId]
            );

            if (owner.rows.length === 0) {
                return res.status(404).json({
                    message: "Store owner not found"
                });
            }

            if (owner.rows[0].role !== "OWNER") {
                return res.status(400).json({
                    message: "Selected user is not a store owner"
                });
            }
        }

        // Create store
        const result = await pool.query(
            `INSERT INTO stores
                (name, email, address, owner_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, address, owner_id`,
            [
                name,
                email,
                address,
                ownerId || null
            ]
        );

        res.status(201).json({
            message: "Store added successfully",
            store: result.rows[0]
        });

    } catch (error) {
        console.error("Add store error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getAllStores,
    addStore
};