import {supabase} from "../config/supabase.js";

// Upload image to Supabase Storage
export const uploadImage = async (bucket, fileName, buffer) => {
    // Upload image
    const {error} = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: false,
        });

    if (error) throw error;

    return fileName;
};

// Delete image from Storage
export const deleteImage = async (bucket, fileName) => {
    // Nothing to delete
    if (!fileName) return;

    // Delete image
    const {error} = await supabase.storage
        .from(bucket)
        .remove([fileName]);

    if (error) throw error;
};

// Get public image url
export const getPublicImageUrl = (bucket, fileName) => {
    // Image not found
    if (!fileName) return null;

    const {data} = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return data.publicUrl;
};

// Create signed url for private images
export const createSignedImageUrl = async (
    bucket,
    fileName,
    expiresIn = 3600, // seconds
) => {
    // Image not found
    if (!fileName) return null;

    const {data, error} = await supabase.storage
        .from(bucket)
        .createSignedUrl(fileName, expiresIn);

    if (error) throw error;

    return data.signedUrl;
};
