# Reference Patterns

Future phases must follow the equivalent Hospital Backend patterns:

- `Route → Middleware → AsyncHandler controller → Supabase → standardized response`.
- `ApiError` passed to `next()` for operational errors.
- Zod schemas parsed asynchronously by validation middleware.
- JWT cookie authentication and `protect → allowedTo(...)` middleware order.
- Cache-aside and cache invalidation only for approved public resources.
- Image upload rollback and replace-image operations only when project/testimonial image management is implemented.
- Pagination through shared utility functions for administrative list endpoints.

These patterns are intentionally not implemented before their approved phase.
