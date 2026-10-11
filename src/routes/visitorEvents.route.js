import express from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { visitorEventRateLimit } from "../middlewares/rateLimit.middleware.js";

import { createVisitorEventSchema } from "../validations/visitorEvents/createVisitorEvent.js";

import { createVisitorEvent } from "../controller/visitorEvents/createVisitorEvent.controller.js";
import { getVisitorAnalytics } from "../controller/visitorEvents/getVisitorAnalytics.controller.js";
import { getVisitorEventsList } from "../controller/visitorEvents/getVisitorEventsList.controller.js";

const router = express.Router();

// ==========================================
// Admin Analytics & Dashboard Endpoints
// Declared before any parameterized routes
// ==========================================
router.get("/dashboard", protect, allowedTo("admin"), getVisitorAnalytics);
router.get("/dashboard/events", protect, allowedTo("admin"), getVisitorEventsList);

// ==========================================
// Public Visitor Event Submission Endpoint
// ==========================================
router.post(
    "/",
    visitorEventRateLimit,
    validate(createVisitorEventSchema),
    createVisitorEvent,
);

export default router;
