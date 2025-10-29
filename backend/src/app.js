const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");
const { connectDB } = require("./config/db");
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// File Upload Middleware
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
app.use('/uploads', express.static('public/uploads'));

connectDB();

// Routes
app.use("/api", routes);

app.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'public', 'uploads', 'documents', filename);

    // Security: Prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const uploadDir = path.resolve(path.join(__dirname, 'public', 'uploads', 'documents'));
    if (!resolvedPath.startsWith(uploadDir)) {
        return res.status(403).send('Forbidden');
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    // Extract original name (remove timestamp)
    const originalName = filename.split('-').slice(1).join('-');

    // Force download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Stream file
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).send('Download failed');
        }
    });
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
