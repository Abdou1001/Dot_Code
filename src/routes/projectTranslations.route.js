import express from "express";
import { protect, allowedTo, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

import { projectTranslationSchema } from "../validations/projectTranslations/projectTranslation.js";
import { getProjectTranslations } from "../controller/projectTranslations/getProjectTranslations.controller.js";
import { getProjectTranslationByLocale } from "../controller/projectTranslations/getProjectTranslationByLocale.controller.js";
import { upsertProjectTranslation } from "../controller/projectTranslations/upsertProjectTranslation.controller.js";
import { deleteProjectTranslation } from "../controller/projectTranslations/deleteProjectTranslation.controller.js";
import { apiRateLimit } from "../middlewares/rateLimit.middleware.js";

const router = express.Router({ mergeParams: true });

// ==========================================
// Public Endpoints (Published projects only, or Admin for all)
// ==========================================
router.get("/", optionalAuth, getProjectTranslations);
router.get("/:locale", optionalAuth, getProjectTranslationByLocale);

// ==========================================
// Admin Endpoints (Require Auth & Admin Role)
// ==========================================
router.post(
    "/",
    protect,
    allowedTo("admin"),
    validate(projectTranslationSchema),
    upsertProjectTranslation,
);

router.put(
    "/:locale",
    protect,
    allowedTo("admin"),
    validate(projectTranslationSchema),
    upsertProjectTranslation,
);

router.delete(
    "/:locale",
    protect,
    allowedTo("admin"),
    deleteProjectTranslation,
);

export default router;
