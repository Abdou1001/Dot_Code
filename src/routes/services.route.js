import express from "express";
import { protect, allowedTo, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

import { createServiceSchema } from "../validations/services/createService.js";
import { updateServiceSchema } from "../validations/services/updateService.js";

import { getServices } from "../controller/services/getServices.controller.js";
import { getAdminServices } from "../controller/services/getAdminServices.controller.js";
import { getServiceById } from "../controller/services/getServiceById.controller.js";
import { createService } from "../controller/services/createService.controller.js";
import { updateService } from "../controller/services/updateService.controller.js";
import { deleteService } from "../controller/services/deleteService.controller.js";

import serviceTranslationsRoutes from "./serviceTranslations.route.js";

const router = express.Router();

// ==========================================
// Admin Dashboard (All services)
// Must be declared before /:id
// ==========================================
router.get("/dashboard", protect, allowedTo("admin"), getAdminServices);

// ==========================================
// Nested Sub-resources
// ==========================================
router.use("/:serviceId/translations", serviceTranslationsRoutes);

// ==========================================
// Public Endpoints
// ==========================================
router.get("/", optionalAuth, getServices);
router.get("/:id", optionalAuth, getServiceById);

// ==========================================
// Admin CRUD Operations (Require Auth & Admin Role)
// ==========================================
router.post(
    "/",
    protect,
    allowedTo("admin"),
    validate(createServiceSchema),
    createService,
);

router.put(
    "/:id",
    protect,
    allowedTo("admin"),
    validate(updateServiceSchema),
    updateService,
);

router.delete(
    "/:id",
    protect,
    allowedTo("admin"),
    deleteService,
);

export default router;
