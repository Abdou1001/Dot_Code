# API & Response Conventions

The API follows the Hospital Backend response format.

## List response

```json
{
  "status": "success",
  "message": "تم جلب البيانات بنجاح",
  "pagination": {},
  "results": []
}
```

## Item or CRUD response

```json
{
  "status": "success",
  "message": "تمت العملية بنجاح",
  "results": {}
}
```

## Error response

Operational errors return `status: "fail"` for 4xx responses and `status: "error"` for 5xx responses. Zod validation errors return an `errors` array with field/message entries.

No application endpoints are implemented in Phase 1.

## Foundation endpoint

`GET /api/health` confirms the backend is running. It follows the standard successful item response and does not access the database.

## Authentication endpoints

- `POST /api/auth/login`: validates email and password, then returns safe admin data in `results.user` and sets an HTTP-only `token` cookie.
- `POST /api/auth/logout`: clears the `token` cookie.
- `GET /api/auth/me`: requires `protect` and `allowedTo("admin")`; returns safe current-admin data in `results.user`.
