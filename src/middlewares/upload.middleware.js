import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new ApiError("Only image files are allowed", 400), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter,
});

export const uploadProjectImage = (req, res, next) => {
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ])(req, res, (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return next(new ApiError("File size exceeds 5MB limit", 400));
            }
            return next(err);
        }
        if (req.files) {
            req.file = req.files.image?.[0] || req.files.file?.[0] || null;
        }
        next();
    });
};

export const uploadTestimonialImage = (req, res, next) => {
    upload.fields([
        { name: "client_image", maxCount: 1 },
        { name: "image", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ])(req, res, (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return next(new ApiError("File size exceeds 5MB limit", 400));
            }
            return next(err);
        }
        if (req.files) {
            req.file =
                req.files.client_image?.[0] ||
                req.files.image?.[0] ||
                req.files.file?.[0] ||
                null;
        }
        next();
    });
};

