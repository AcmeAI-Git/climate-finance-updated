const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'documents');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Uploads a PDF file to the server and returns a public URL
 * @param {Object} file - File object from express-fileupload
 * @param {string} [customName] - Optional: override filename
 * @returns {Promise<string>} - Public URL of the uploaded PDF
 */
const uploadFile = async (file, customName = null) => {
    try {
        // Validate: must be PDF
        if (file.mimetype !== 'application/pdf') {
            throw new Error('Only PDF files are allowed');
        }

        // Use original name or custom name, sanitize
        const originalName = customName || file.name;
        const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_'); // Prevent path traversal
        const fileName = `${Date.now()}-${safeName}`; // Prevent overwrites
        const filePath = path.join(UPLOAD_DIR, fileName);

        // Move file from temp to permanent location
        await new Promise((resolve, reject) => {
            file.mv(filePath, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        return `${fileName}`;

    } catch (error) {
        console.error('PDF upload failed:', error.message);
        throw new Error(`Upload failed: ${error.message}`);
    }
};

module.exports = { uploadFile };