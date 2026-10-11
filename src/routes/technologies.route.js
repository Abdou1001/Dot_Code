import express from "express";
import { protect, allowedTo, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";

import { createTechnologySchema } from "../validations/technologies/createTechnology.js";
import { updateTechnologySchema } from "../validations/technologies/updateTechnology.js";

import { getTechnologies } from "../controller/technologies/getTechnologies.controller.js";
import { getAdminTechnologies } from "../controller/technologies/getAdminTechnologies.controller.js";
import { getTechnologyById } from "../controller/technologies/getTechnologyById.controller.js";
import { createTechnology } from "../controller/technologies/createTechnology.controller.js";
import { updateTechnology } from "../controller/technologies/updateTechnology.controller.js";
import { deleteTechnology } from "../controller/technologies/deleteTechnology.controller.js";

const router = express.Router();

// ==========================================
// Admin Dashboard (All technologies)
// Must be declared before /:id
// ==========================================
router.get("/dashboard", protect, allowedTo("admin"), getAdminTechnologies);

// ==========================================
// Public Endpoints
// ==========================================
router.get("/", optionalAuth, getTechnologies);
router.get("/:id", optionalAuth, getTechnologyById);

// ==========================================
// Admin CRUD Operations (Require Auth & Admin Role)
// ==========================================
router.post(
    "/",
    protect,
    allowedTo("admin"),
    validate(createTechnologySchema),
    createTechnology,
);

router.put(
    "/:id",
    protect,
    allowedTo("admin"),
    validate(updateTechnologySchema),
    updateTechnology,
);

router.delete(
    "/:id",
    protect,
    allowedTo("admin"),
    deleteTechnology,
);

export default router;
