const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function createAdmin() {
    try {
        const name = "System Administrator Account";
        const email = "admin@example.com";
        const password = "Admin@123";
        const address = "Nagpur, Maharashtra, India";
        const role = "ADMIN";

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, address, role`,
            [
                name,
                email,
                hashedPassword,
                address,
                role
            ]
        );

        console.log("Admin created successfully:");
        console.log(result.rows[0]);

    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await pool.end();
    }
}

createAdmin();