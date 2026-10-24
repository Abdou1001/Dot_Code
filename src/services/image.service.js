import { processImage } from "../utils/imageUploader.js";
import { uploadImage, deleteImage, getPublicImageUrl } from "./storage.service.js";

// Upload image and return image name
export const uploadAndProcessImage = async (bucket, file) => {
    // No image uploaded
    if (!file) return null;

    // Resize & compress image
    const { fileName, buffer } = await processImage(file.buffer);

    // Upload image to Storage
    await uploadImage(bucket, fileName, buffer);

    return fileName;
};

// Get public URL for image name or external URL
export const getImageUrl = (bucket, fileName) => {
    if (!fileName) return null;
    return getPublicImageUrl(bucket, fileName);
};

// Format a single object/record to include the resolved public image URL
export const formatRecordImage = (bucket, record, field = "image_url") => {
    if (!record) return null;
    if (record[field]) {
        return {
            ...record,
            [field]: getImageUrl(bucket, record[field]),
        };
    }
    return record;
};

// Format an array of objects/records to include the resolved public image URLs
export const formatRecordImages = (bucket, records, field = "image_url") => {
    if (!Array.isArray(records)) return [];
    return records.map((record) => formatRecordImage(bucket, record, field));
};

// Replace image safely
export const replaceImage = async ({ bucket, currentImage, file, action }) => {
    // Keep old image
    let newImage = currentImage;

    try {
        // Upload new image if exists
        if (file) {
            newImage = await uploadAndProcessImage(bucket, file);
        }

        // Execute database operation
        const result = await action(newImage);

        // Delete old image after success
        if (file && currentImage && currentImage !== newImage) {
            await deleteImage(bucket, currentImage);
        }

        return result;
    } catch (err) {
        // Rollback uploaded image
        if (file && newImage !== currentImage) {
            await rollbackUploadedImage(bucket, newImage);
        }

        throw err;
    }
};

// Delete uploaded image if something failed
export const rollbackUploadedImage = async (bucket, fileName) => {
    if (!fileName) return;

    await deleteImage(bucket, fileName);
};

export { getPublicImageUrl, uploadImage, deleteImage };



