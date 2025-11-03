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
app.use('/uploads', express.static('/var/repository/data/uploads/documents'));

connectDB();

// Routes
app.use("/api", routes);

app.get('/document/:filename', (req, res) => {
    const { filename } = req.params;
    const { download } = req.query; // ?download=true

    // Use persistent disk path instead of local public folder
    const BASE_UPLOAD_DIR = '/var/repository/data/uploads/documents';
    const filePath = path.join(BASE_UPLOAD_DIR, filename);

    // Security: prevent directory traversal attacks
    const resolvedPath = path.resolve(filePath);
    const safeBase = path.resolve(BASE_UPLOAD_DIR);
    if (!resolvedPath.startsWith(safeBase)) {
        return res.status(403).send('Forbidden');
    }

    // Check file existence
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    // Derive original filename (removing timestamp prefix)
    const originalName = filename.split('-').slice(1).join('-') || filename;

    // If ?download=true, force download; otherwise, open inline
    const disposition = download === 'true' ? 'attachment' : 'inline';

    res.setHeader('Content-Disposition', `${disposition}; filename="${originalName}"`);
    res.setHeader('Content-Type', 'application/pdf');

    res.sendFile(filePath);
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
