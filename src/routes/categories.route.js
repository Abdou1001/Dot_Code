import express from "express";
import { protect, allowedTo, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

import { createCategorySchema } from "../validations/categories/createCategory.js";
import { updateCategorySchema } from "../validations/categories/updateCategory.js";

import { getCategories } from "../controller/categories/getCategories.controller.js";
import { getAdminCategories } from "../controller/categories/getAdminCategories.controller.js";
import { getCategoryById } from "../controller/categories/getCategoryById.controller.js";
import { createCategory } from "../controller/categories/createCategory.controller.js";
import { updateCategory } from "../controller/categories/updateCategory.controller.js";
import { deleteCategory } from "../controller/categories/deleteCategory.controller.js";

const router = express.Router();

// ==========================================
// Admin Dashboard (All categories)
// Must be declared before /:id
// ==========================================
router.get("/dashboard", protect, allowedTo("admin"), getAdminCategories);

// ==========================================
// Public Endpoints
// ==========================================
router.get("/", optionalAuth, getCategories);
router.get("/:id", optionalAuth, getCategoryById);

// ==========================================
// Admin CRUD Operations (Require Auth & Admin Role)
// ==========================================
router.post(
    "/",
    protect,
    allowedTo("admin"),
    validate(createCategorySchema),
    createCategory,
);

router.put(
    "/:id",
    protect,
    allowedTo("admin"),
    validate(updateCategorySchema),
    updateCategory,
);

router.delete(
    "/:id",
    protect,
    allowedTo("admin"),
    deleteCategory,
);

export default router;
