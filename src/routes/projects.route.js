import express from "express";
import { protect, allowedTo, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

import { createProjectSchema } from "../validations/projects/createProject.js";
import { updateProjectSchema } from "../validations/projects/updateProject.js";
import { updateProjectStatusSchema } from "../validations/projects/updateProjectStatus.js";

import { getProjects } from "../controller/projects/getProjects.controller.js";
import { getProjectBySlug } from "../controller/projects/getProjectBySlug.controller.js";
import { getAdminProjects } from "../controller/projects/getAdminProjects.controller.js";
import { createProject } from "../controller/projects/createProject.controller.js";
import { updateProject } from "../controller/projects/updateProject.controller.js";
import { updateProjectStatus } from "../controller/projects/updateProjectStatus.controller.js";
import { deleteProject } from "../controller/projects/deleteProject.controller.js";

import projectTranslationsRoutes from "./projectTranslations.route.js";
import projectImagesRoutes from "./projectImages.route.js";
import projectTechnologiesRoutes from "./projectTechnologies.route.js";
import projectCategoriesRoutes from "./projectCategories.route.js";

const router = express.Router();

// ==========================================
// Admin Dashboard (All projects: drafts & published)
// Must be declared before /:slug
// ==========================================
router.get("/dashboard", protect, allowedTo("admin"), getAdminProjects);

// ==========================================
// Nested Sub-resources
// ==========================================
router.use("/:projectId/translations", projectTranslationsRoutes);
router.use("/:projectId/images", projectImagesRoutes);
router.use("/:projectId/technologies", projectTechnologiesRoutes);
router.use("/:projectId/categories", projectCategoriesRoutes);

// ==========================================
// Public Endpoints (Published projects only)
// ==========================================
router.get("/", optionalAuth, getProjects);
router.get("/:slug", optionalAuth, getProjectBySlug);

// ==========================================
// Admin CRUD Operations (Require Auth & Admin Role)
// ==========================================
router.post(
    "/",
    protect,
    allowedTo("admin"),
    validate(createProjectSchema),
    createProject,
);

router.put(
    "/:id",
    protect,
    allowedTo("admin"),
    validate(updateProjectSchema),
    updateProject,
);

router.patch(
    "/:id/status",
    protect,
    allowedTo("admin"),
    validate(updateProjectStatusSchema),
    updateProjectStatus,
);

router.delete(
    "/:id",
    protect,
    allowedTo("admin"),
    deleteProject,
);

export default router;
