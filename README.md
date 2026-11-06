# shared-core

Generic, provider-free building blocks shared by the lending app and the school ERP. Approved in `lending-app/docs/02-architecture.md` (D10, option A).

## What is in this package

- `parseEnv(schema, source?)`: validates environment variables against a Zod schema. Errors name the failing variable but never print its value.
- `AppError`: an error with an HTTP status and a stable code. Only 4xx messages reach clients. 5xx errors return a generic message, so database text never leaks.
- `isAppError(value)`: type guard.

## What is deliberately not here

- No Express code. Middleware is added later, with Express as a peer dependency.
- No Supabase, Cloudflare, AWS or Azure code. Providers stay in each product's adapters.
- No school or lending domain code.

## Installing (git tag, option A)

Consumers depend on an exact tag, never a branch:

```json
"@sharan-career/shared-core": "git+https://github.com/sharan-career/shared-core.git#v0.1.0"
```

Zod must be installed by the consumer at the same exact version (`4.6.7`), because this package uses the consumer's Zod.

## Development

```
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

Node 26.12.1 (see `.nvmrc`). Versions are exact pins.
