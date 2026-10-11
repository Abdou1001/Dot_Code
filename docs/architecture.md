# Backend Architecture

## Overview

The backend follows the Hospital Management System layered pattern:

```text
Request → Route → Middleware Chain → Controller → Service / Utils → Supabase
```

Controllers will contain resource business logic and Supabase queries. `services/` will wrap infrastructure concerns only, such as cache, storage, image processing, and email.

## Phase 1 foundation

- `src/server.js`: loads validated environment configuration, starts Express, and handles process-level unhandled rejections.
- `src/app.js`: configures Helmet, CORS, parsers, cookies, compression, unmatched-route handling, and global errors.
- `src/config/env.js`: validates required runtime configuration before the server starts.
- `src/config/supabase.js`: exports the server-only Supabase client.
- `src/middlewares/error.middleware.js`: formats operational, JWT, and Zod errors.
- `src/utils/ApiError.js`: application error class.
- `src/utils/response.js`: consistent successful response helper.
- `src/routes/base.route.js` and `src/controller/base.controller.js`: base route structure and a non-domain health check.

Feature routes and controllers will be added only in their approved phases.

## Phase 2 authentication

- `src/routes/auth.route.js`: login, logout, and current-admin routes.
- `src/controller/auth.controller.js`: admin credential verification, JWT creation, cookie delivery, and safe current-user responses.
- `src/middlewares/auth.middleware.js`: cookie JWT protection and role authorization.
- `src/middlewares/validation.middleware.js` and `src/validations/auth.validation.js`: asynchronous Zod request-body validation.
