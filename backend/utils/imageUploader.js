const cloudinary = require("cloudinary").v2;
const fs = require("fs");

exports.uploadImageToCloudinary = async (file, height, quality = 90) => {
    try {
        const folder = process.env.CLOUDINARY_FOLDER_NAME || "flybird2.1";
        const options = { folder, resource_type: "auto" };

        if (height) options.height = height;
        if (quality) options.quality = quality;

        // Ensure temp file path exists
        if (!file.tempFilePath) {
            throw new Error("File upload failed: No temp file path");
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, options);

        // Delete temp file safely
        if (fs.existsSync(file.tempFilePath)) {
            fs.unlinkSync(file.tempFilePath);
        }

        return result;
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        throw error;
    }
};
