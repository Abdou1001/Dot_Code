# Backend Agent Instructions

Follow the documented architecture in this project:

- **Request flow**: `Route → Middleware Chain → Controller → Service / Supabase → Response`.

- **Controller Architecture & Folder Structure (Strict Rule)**:
  - Every domain/resource **MUST** have its own dedicated directory inside `src/controller/<resource>/` (e.g., `src/controller/auth/`, `src/controller/projects/`).
  - Every controller action/endpoint **MUST** reside in its own separate file following the naming convention `<action>.controller.js`:
    - Example:
      - `src/controller/projects/getProjects.controller.js`
      - `src/controller/projects/getProjectBySlug.controller.js`
      - `src/controller/projects/createProject.controller.js`
      - `src/controller/projects/updateProject.controller.js`
      - `src/controller/projects/updateProjectStatus.controller.js`
      - `src/controller/projects/deleteProject.controller.js`
  - **Single Action per File**: Never combine multiple controller handlers into one file.
  - **Route Imports**: Route files (`src/routes/<resource>.route.js`) must import each controller handler directly from its dedicated file:
    ```javascript
    import { getProjects } from "../controller/projects/getProjects.controller.js";
    import { createProject } from "../controller/projects/createProject.controller.js";
    ```
  - An optional domain file (`src/controller/<resource>.controller.js`) can re-export all actions for backwards compatibility:
    ```javascript
    export * from "./<resource>/<action>.controller.js";
    ```

- **Redis Caching & Invalidation Pattern**:
  - Redis connection instance is configured in `src/config/redis.js` using `ioredis`.
  - Cache keys and TTL constants are centralized in `src/config/cache.js` (`CACHE_KEYS`, `CACHE_TTL`).
  - Cache helper operations are exposed in `src/services/cache.service.js`:
    - `getCache(key)`: Retrieves parsed JSON from Redis.
    - `setCache(key, value, ttl)`: Stores JSON serialized data with expiration.
    - `deleteCache(key)`: Removes a specific cache key.
    - `deleteByPattern(pattern)`: Deletes all matching cache keys (e.g., `"projects:*"`).
  - **Cache-Aside Pattern for Public Endpoints**:
    1. Check `getCache(key)` first. If hit, return cached data immediately.
    2. If miss, query Supabase and store result with `setCache(key, data, ttl)`.
  - **Cache Invalidation on Mutations**:
    - Any mutating admin action (`POST`, `PUT`, `DELETE`) must invalidate related cache keys and list patterns using `deleteCache` and `deleteByPattern`.

- **Storage Buckets**:
  - Centralized storage bucket names are defined in `src/config/storage.js` (`STORAGE_BUCKETS`).
  - Bucket names must be used as constants across services and controllers rather than hardcoded strings.

- **Folder & Layer Organization**:
  - `src/controller/<resource>/<action>.controller.js`: Controllers containing business logic, caching, and Supabase queries.
  - `src/routes/<resource>.route.js`: Express route definitions connecting middlewares to controllers.
  - `src/validations/<resource>/`: Resource validation schemas (Zod).
  - `src/services/`: Infrastructure wrappers only (`cache.service.js`, email, storage).
  - `src/config/`: Configuration & environment loading (`redis.js`, `cache.js`, `storage.js`, `env.js`, `supabase.js`).
  - `src/utils/`: Pure utility functions and shared helpers (`pagination.js`, `response.js`, `ApiError.js`).
  - `src/middlewares/`: Express middlewares (auth, validation, error, rateLimit).

- **Handler Standards**:
  - Use named ESM exports.
  - Wrap handlers with `express-async-handler` (`AsyncHandler`).
  - Use `ApiError` for throwing operational errors.
  - Use `sendSuccess` helper for standardized responses.

- **Conventions & Safety**:
  - Follow the response and naming conventions in `docs/`.
  - Do not add packages, change the database schema, or create public write access without explicit approval.
  - Read `docs/reference-patterns.md` before implementing a matching feature.
