import sharp from "sharp";
import crypto from "crypto";

// Resize & compress image
export const processImage = async (fileBuffer) => {
    // Random image name
    const fileName = crypto.randomUUID() + ".webp";

    // Compress image
    const buffer = await sharp(fileBuffer)
        // reduce size of img 4000px => 1200px
        .resize({
            width: 1200,
            withoutEnlargement: true,
        })
        // change extension img to webp qualty 80%
        .webp({
            quality: 80,
        })
        .toBuffer();

    return {
        fileName,

        buffer,
    };
};
