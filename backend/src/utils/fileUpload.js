const path = require('path');
const fs = require('fs');

// Use Render persistent disk mount path
const DISK_PATH = '/var/repository/data/uploads/documents';

// Ensure directory exists
fs.mkdirSync(DISK_PATH, { recursive: true });

/**
 * Uploads a PDF file to the persistent disk and returns the file name
 * @param {Object} file - File object from express-fileupload
 * @param {string} [customName] - Optional: override filename
 * @returns {Promise<string>} - Uploaded file name
 */
const uploadFile = async (file, customName = null) => {
    try {
        if (file.mimetype !== 'application/pdf') {
            throw new Error('Only PDF files are allowed');
        }

        const originalName = customName || file.name;
        const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${Date.now()}-${safeName}`;
        const filePath = path.join(DISK_PATH, fileName);

        // Save file
        await new Promise((resolve, reject) => {
            file.mv(filePath, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        console.log('File uploaded:', filePath);
        return fileName;

    } catch (error) {
        console.error('PDF upload failed:', error.message);
        throw new Error(`Upload failed: ${error.message}`);
    }
};

module.exports = { uploadFile };
