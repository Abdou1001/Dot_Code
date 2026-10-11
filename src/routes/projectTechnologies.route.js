import express from "express";
import { protect, allowedTo, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

import { assignProjectTechnologySchema } from "../validations/projectTechnologies/assignProjectTechnology.js";

import { getProjectTechnologies } from "../controller/projectTechnologies/getProjectTechnologies.controller.js";
import { assignProjectTechnology } from "../controller/projectTechnologies/assignProjectTechnology.controller.js";
import { removeProjectTechnology } from "../controller/projectTechnologies/removeProjectTechnology.controller.js";

const router = express.Router({ mergeParams: true });

// ==========================================
// Public Endpoints (Published projects only, or Admin for all)
// ==========================================
router.get("/", optionalAuth, getProjectTechnologies);

// ==========================================
// Admin Endpoints (Require Auth & Admin Role)
// ==========================================
router.post(
    "/",
    protect,
    allowedTo("admin"),
    validate(assignProjectTechnologySchema),
    assignProjectTechnology,
);

router.delete(
    "/:technologyId",
    protect,
    allowedTo("admin"),
    removeProjectTechnology,
);

export default router;
