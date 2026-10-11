import express from "express";
import { protect, allowedTo, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { uploadProjectImage } from "../middlewares/upload.middleware.js";

import { createProjectImageSchema } from "../validations/projectImages/createProjectImage.js";
import { updateProjectImageSchema } from "../validations/projectImages/updateProjectImage.js";

import { getProjectImages } from "../controller/projectImages/getProjectImages.controller.js";
import { getProjectImageById } from "../controller/projectImages/getProjectImageById.controller.js";
import { createProjectImage } from "../controller/projectImages/createProjectImage.controller.js";
import { updateProjectImage } from "../controller/projectImages/updateProjectImage.controller.js";
import { deleteProjectImage } from "../controller/projectImages/deleteProjectImage.controller.js";

const router = express.Router({ mergeParams: true });

// ==========================================
// Public Endpoints (Published projects only, or Admin for all)
// ==========================================
router.get("/", optionalAuth, getProjectImages);
router.get("/:id", optionalAuth, getProjectImageById);

// ==========================================
// Admin Endpoints (Require Auth & Admin Role)
// ==========================================
router.post(
    "/",
    protect,
    allowedTo("admin"),
    uploadProjectImage,
    validate(createProjectImageSchema),
    createProjectImage,
);

router.put(
    "/:id",
    protect,
    allowedTo("admin"),
    uploadProjectImage,
    validate(updateProjectImageSchema),
    updateProjectImage,
);

router.delete(
    "/:id",
    protect,
    allowedTo("admin"),
    deleteProjectImage,
);

export default router;
