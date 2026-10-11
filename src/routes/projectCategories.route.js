import express from "express";
import { protect, allowedTo, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

import { assignProjectCategorySchema } from "../validations/projectCategories/assignProjectCategory.js";

import { getProjectCategories } from "../controller/projectCategories/getProjectCategories.controller.js";
import { assignProjectCategory } from "../controller/projectCategories/assignProjectCategory.controller.js";
import { removeProjectCategory } from "../controller/projectCategories/removeProjectCategory.controller.js";

const router = express.Router({ mergeParams: true });

// ==========================================
// Public Endpoints (Published projects only, or Admin for all)
// ==========================================
router.get("/", optionalAuth, getProjectCategories);

// ==========================================
// Admin Endpoints (Require Auth & Admin Role)
// ==========================================
router.post(
    "/",
    protect,
    allowedTo("admin"),
    validate(assignProjectCategorySchema),
    assignProjectCategory,
);

router.delete(
    "/:categoryId",
    protect,
    allowedTo("admin"),
    removeProjectCategory,
);

export default router;
