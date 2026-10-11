import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";

// Middlewares
import ApiError from "./utils/ApiError.js";
import { globalError } from "./middlewares/error.middleware.js";
import { env } from "./config/env.js";

// Routes
import AuthRoutes from "./routes/auth.route.js";
import ProjectRoutes from "./routes/projects.route.js";
import TechnologyRoutes from "./routes/technologies.route.js";
import CategoryRoutes from "./routes/categories.route.js";
import ServiceRoutes from "./routes/services.route.js";
import TestimonialRoutes from "./routes/testimonials.route.js";
import MessageRoutes from "./routes/messages.route.js";
import VisitorEventRoutes from "./routes/visitorEvents.route.js";
import { apiRateLimit } from "./middlewares/rateLimit.middleware.js";

// Use Express
const app = express();

// Security Headers
app.use(helmet());

// Core to send data to front end
app.use(
    cors({
        origin: env.FRONTEND_URL,
        credentials: true,
    }),
);

// Read json
app.use(express.json());

// Read form data
app.use(express.urlencoded({ extended: true }));

// To put token in cookie
app.use(cookieParser());

// Compression JSON size
app.use(compression());

// Rate Limit لجميع API
app.use("/api", apiRateLimit);

// ========== Routes ============
app.use("/api/auth", AuthRoutes);
app.use("/api/projects", ProjectRoutes);
app.use("/api/technologies", TechnologyRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/services", ServiceRoutes);
app.use("/api/testimonials", TestimonialRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/visitor-events", VisitorEventRoutes);

// 404 handler
app.all("/{*any}", (req, res, next) => {
    next(new ApiError(`No route found for this URL: ${req.originalUrl}`, 404));
});

// Error handler
app.use(globalError);

export default app;
