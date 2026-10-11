import express from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { messageRateLimit } from "../middlewares/rateLimit.middleware.js";

import { createMessageSchema } from "../validations/messages/createMessage.js";
import { updateMessageStatusSchema } from "../validations/messages/updateMessageStatus.js";

import { createMessage } from "../controller/messages/createMessage.controller.js";
import { getAdminMessages } from "../controller/messages/getAdminMessages.controller.js";
import { getMessageById } from "../controller/messages/getMessageById.controller.js";
import { updateMessageStatus } from "../controller/messages/updateMessageStatus.controller.js";
import { deleteMessage } from "../controller/messages/deleteMessage.controller.js";

const router = express.Router();

// ==========================================
// Admin Dashboard (All messages)
// Must be declared before /:id
// ==========================================
router.get("/dashboard", protect, allowedTo("admin"), getAdminMessages);

// ==========================================
// Public Submission Endpoint
// ==========================================
router.post(
    "/",
    messageRateLimit,
    validate(createMessageSchema),
    createMessage,
);

// ==========================================
// Admin Read & Write Endpoints
// ==========================================
router.get("/:id", protect, allowedTo("admin"), getMessageById);

router.patch(
    "/:id/status",
    protect,
    allowedTo("admin"),
    validate(updateMessageStatusSchema),
    updateMessageStatus,
);

router.delete("/:id", protect, allowedTo("admin"), deleteMessage);

export default router;
