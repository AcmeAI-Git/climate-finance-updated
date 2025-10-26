const cloudinary = require("cloudinary").v2;

// Configure cloudinary with URL
cloudinary.config({
    url:
        process.env.CLOUDINARY_URL ||
        "cloudinary://317229912258349:HvIDtadVAjXdQJCRGka5UtvH88U@datthtaal",
});

/**
 * Uploads a file to Cloudinary and returns the URL
 * @param {Object} file - The file object from the request
 * @returns {Promise<string>} - The URL of the uploaded file
 */
const uploadFile = async (file) => {
    try {
        // Upload the file to cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "climate-finance/documents", // Customize folder name as needed
            resource_type: "auto",
        });

        return result.secure_url;
    } catch (error) {
        console.error("Error uploading file to cloudinary:", error);
        throw new Error("File upload failed");
    }
};

module.exports = {
    uploadFile,
};
