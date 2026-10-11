import express from "express";
import { protect, allowedTo, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { uploadTestimonialImage } from "../middlewares/upload.middleware.js";

import { createTestimonialSchema } from "../validations/testimonials/createTestimonial.js";
import { updateTestimonialSchema } from "../validations/testimonials/updateTestimonial.js";

import { getTestimonials } from "../controller/testimonials/getTestimonials.controller.js";
import { getAdminTestimonials } from "../controller/testimonials/getAdminTestimonials.controller.js";
import { getTestimonialById } from "../controller/testimonials/getTestimonialById.controller.js";
import { createTestimonial } from "../controller/testimonials/createTestimonial.controller.js";
import { updateTestimonial } from "../controller/testimonials/updateTestimonial.controller.js";
import { deleteTestimonial } from "../controller/testimonials/deleteTestimonial.controller.js";

const router = express.Router();

// ==========================================
// Admin Dashboard (All testimonials)
// Must be declared before /:id
// ==========================================
router.get("/dashboard", protect, allowedTo("admin"), getAdminTestimonials);

// ==========================================
// Public Endpoints (Published only)
// ==========================================
router.get("/", optionalAuth, getTestimonials);
router.get("/:id", optionalAuth, getTestimonialById);

// ==========================================
// Admin CRUD Operations (Require Auth & Admin Role)
// ==========================================
router.post(
    "/",
    protect,
    allowedTo("admin"),
    uploadTestimonialImage,
    validate(createTestimonialSchema),
    createTestimonial,
);

router.put(
    "/:id",
    protect,
    allowedTo("admin"),
    uploadTestimonialImage,
    validate(updateTestimonialSchema),
    updateTestimonial,
);

router.delete(
    "/:id",
    protect,
    allowedTo("admin"),
    deleteTestimonial,
);

export default router;
