const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Store Rating API is running"
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});