# GAPP — Agent Guide

GAPP is a ground app for high-altitude balloon flights (ODZ-UJF-AV-CR). Turborepo + pnpm monorepo. In production, a single Docker image runs the Fastify server which also serves the built Angular dashboard as static files.

## Layout (verified)

- `apps/server` — Fastify 5 + Kysely (Postgres) + Influx 2 client + TypeBox via `@fastify/type-provider-typebox`. Entry `src/main.ts` → `src/app.ts`. Wiring is Controllers (Fastify plugins) → Services (classes) → Repositories (classes); DI happens in `src/plugins/{repositories,services}.ts`, which decorate the Fastify instance.
- `apps/dashboard` — Angular 21, standalone components, Signals, Tailwind 4 + DaisyUI 5. Tests use `ng test` (`@angular/build:unit-test`, Vitest globals from `tsconfig.spec.json`).
- `packages/shared` — Cross-app TypeBox schemas exported as `*Schema` (e.g. `VehicleCreateSchema`, `VehicleGetSchema`). **All API schemas live here**; there is no `apps/server/src/schemas/` directory.
- `packages/sondehub` — SondeHub uploader library.
- Note: `pnpm-workspace.yaml` lists `packages/ui`, `packages/ui/libs/forms`, `packages/ui/libs/utils` — those directories do not exist. Ignore them; do not import `@gapp/ui`.

## Setup & dev

1. `nvm use` — Node `v24.5.0` is required (`.nvmrc`). Enable corepack so the pinned pnpm runs.
2. `pnpm install`.
3. `docker compose up -d` — **required before `pnpm dev`**. Starts Postgres on `localhost:5434` and InfluxDB on `localhost:8086` (creds in `compose.yml`; matching dev defaults are baked into `apps/server/src/config.ts` via `envalid`).
4. `pnpm dev` — runs `turbo run dev` for both apps.
   - Server only: `pnpm --filter @gapp/server run dev` (uses `tsx watch` piped through `pino-pretty`).
   - Dashboard only: `pnpm --filter @gapp/dashboard run dev` (`ng serve`).
5. Useful URLs while running locally: Swagger UI `http://localhost:3000/docs`, Influx UI `http://localhost:8086` (`user` / `password`).

## Commands

- Build everything: `pnpm build` (= `turbo run build`). `@gapp/dashboard` and `@gapp/server` consume `@gapp/shared`, so Turbo's `^build` chain rebuilds it first.
- Lint: `pnpm lint` (Biome). Auto-fix + format: `pnpm lint:fix` (= `biome check --write`).
- Tests: there is **no root `test` task**. Only `apps/dashboard` has tests today: `pnpm --filter @gapp/dashboard run test`. Server and `packages/*` have no tests yet.
- Create a Kysely migration: `pnpm --filter @gapp/server run create-migration <name>` (= `kysely migrate:make -x ts`). Files land in `apps/server/src/migrations/`. Config is `.config/kysely.config.ts`.
- **Migrations apply automatically on server startup** — see `migrateToLatest` in `apps/server/src/plugins/postgresdb.ts:51`. Do not run `kysely migrate:latest` manually.

## Pre-commit

Husky's `pre-commit` runs `pnpm lint-staged`, which executes `biome check --write --no-errors-on-unmatched` on staged `*.{js,ts,json,css,html}`. Don't bypass with `--no-verify` unless explicitly asked.

## Style — non-defaults that trip agents

- **Biome** (`biome.json`): 4-space indent, **line width 160**, single quotes, trailing commas, semicolons always, LF. Two recommended rules are turned off: `suspicious/useIterableCallbackReturn`, `correctness/noInvalidUseBeforeDeclaration`.
- **Server imports**: `apps/server` is `"type": "module"` and its tsconfig sets `rewriteRelativeImportExtensions` + `allowImportingTsExtensions`. Local imports must include the `.ts` extension (e.g. `import { app } from './app.ts'`). This is required by the runtime, not stylistic.
- **Dashboard tsconfig** has `noPropertyAccessFromIndexSignature`, `strictTemplates`, `strictInputAccessModifiers`. Use bracket access for index-signature objects.
- **Dashboard path aliases** (`apps/dashboard/tsconfig.json`): `@core/*`, `@shared/*`, `@features/*`, `@env/*`, `@app/*`, `@/*`. Prefer these over deep relative imports.
- **API schemas** are exported from `@gapp/shared` as `*Schema` (e.g. `VehicleCreateSchema`). The codebase does **not** use `B_`/`R_` prefixes for body/response schemas.
- **Angular conventions**: standalone components, Signals (`signal`, `computed`, `effect`) over `BehaviorSubject`, `ChangeDetectionStrategy.OnPush` (see `src/app/app.ts`), separate `.html` and `.css` files, `protected readonly` for template-bound members.
- **Fastify error handling**: handled globally by `apps/server/src/plugins/error-handler.ts`. Controllers must **not** use `try/catch`. Services throw domain errors from `apps/server/src/utils/errors.ts` (`NotFoundError` → 404, `ConflictError` → 409, `ValidationError` → 422); anything else is logged and returned as 500. Translate Postgres unique violations into `ConflictError` in the service (use `isUniqueViolation(e)`) so the message keeps its context — never match on constraint names.

### Example controller pattern

```ts
fastify.post('', { schema: { body: VehicleCreateSchema, response: { 201: VehicleGetSchema } } }, async (req, rep) => {
    const result = await req.server.vehicleService.createVehicle(req.body);
    rep.status(201).send(result);
});
```

### Example standalone component

```ts
@Component({
    selector: 'app-feature',
    imports: [CommonModule],
    templateUrl: './feature.html',
    styleUrl: './feature.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureComponent {
    protected readonly data = signal<string>('init');
}
```

## Adding a DB field — required order

1. New migration in `apps/server/src/migrations/<timestamp>_<name>.ts` (use `create-migration`).
2. Update the Kysely interface in `apps/server/src/repository/postgres-database.ts` (uses `ColumnType`, `Generated`, `Selectable`, `Insertable`, `Updateable`).
3. Update the relevant TypeBox schema in `packages/shared/src/*.schema.ts` and rebuild shared (`pnpm --filter @gapp/shared run build`) so server and dashboard pick up the new types.
4. `pnpm build` to verify types end-to-end.

## Production / CI

- `Dockerfile` is multi-stage: builds dashboard + server, then `pnpm --filter @gapp/server deploy --prod server`. At runtime the Fastify server serves the built dashboard from `../../dashboard/` (see `DASHBOARD_STATIC_FILES` in `apps/server/src/config.ts` and the `fastifyStatic` registration in `apps/server/src/main.ts`).
- `.github/workflows/production.yml` builds and pushes `ghcr.io/odz-ujf-av-cr/gapp` on push to `main` and on version tags `vX.Y.Z`.

## Don't

- Don't add tests via Jest or Karma — only Vitest (through Angular's `unit-test` builder), and only in `apps/dashboard` so far.
- Don't reach for `BehaviorSubject` in the dashboard — use Signals.
- Don't introduce `apps/server/src/schemas/`; schemas belong in `@gapp/shared`.
- Don't run `kysely migrate:latest` by hand; the server applies migrations on boot.
- Don't commit `.env` files or hardcoded secrets. Dev secrets come from `compose.yml` and `envalid` `devDefault` values in `apps/server/src/config.ts`.
