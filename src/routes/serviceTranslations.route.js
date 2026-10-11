import express from "express";
import { protect, allowedTo, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

import {
    serviceTranslationSchema,
    createServiceTranslationSchema,
} from "../validations/serviceTranslations/serviceTranslation.js";

import { getServiceTranslations } from "../controller/serviceTranslations/getServiceTranslations.controller.js";
import { getServiceTranslationByLocale } from "../controller/serviceTranslations/getServiceTranslationByLocale.controller.js";
import { createServiceTranslation } from "../controller/serviceTranslations/createServiceTranslation.controller.js";
import { upsertServiceTranslation } from "../controller/serviceTranslations/upsertServiceTranslation.controller.js";
import { deleteServiceTranslation } from "../controller/serviceTranslations/deleteServiceTranslation.controller.js";

const router = express.Router({ mergeParams: true });

// ==========================================
// Public Endpoints (Active services only, or Admin for all)
// ==========================================
router.get("/", optionalAuth, getServiceTranslations);
router.get("/:locale", optionalAuth, getServiceTranslationByLocale);

// ==========================================
// Admin Endpoints (Require Auth & Admin Role)
// ==========================================
router.post(
    "/",
    protect,
    allowedTo("admin"),
    validate(createServiceTranslationSchema),
    createServiceTranslation,
);

router.put(
    "/:locale",
    protect,
    allowedTo("admin"),
    validate(serviceTranslationSchema),
    upsertServiceTranslation,
);

router.delete(
    "/:locale",
    protect,
    allowedTo("admin"),
    deleteServiceTranslation,
);

export default router;
