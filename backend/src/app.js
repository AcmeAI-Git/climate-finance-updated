const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");
const { connectDB } = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

connectDB();

// Routes
app.use("/api", routes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
