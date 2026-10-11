# Coding Conventions

The project follows the Hospital Backend conventions.

| Layer | Pattern |
| --- | --- |
| Controller | `[entity].controller.js` |
| Route | `[entity].route.js` |
| Middleware | `[feature].middleware.js` |
| Validation | `[entity].validation.js` |
| Service | `[feature].service.js` |
| Config | `[service].js` |
| Utility | `[feature].js` |

- Use ESM imports/exports.
- Use `camelCase` for JavaScript variables/functions, `snake_case` for database fields and request payload keys, and `SCREAMING_SNAKE_CASE` for exported constants.
- Export controller functions as named functions wrapped in `express-async-handler`.
- Use `ApiError` for operational errors and let `globalError` format responses.
- Validate request input through Zod schemas in the validation middleware once that phase begins.
