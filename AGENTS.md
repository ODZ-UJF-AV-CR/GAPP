# GAPP Development Guide for Agents

This guide provides instructions for agentic coding tools operating in the GAPP repository. GAPP is a ground application for managing stratospheric balloon flights, built with Angular and Fastify in a Turborepo monorepo.

## Project Structure
- **apps/dashboard**: Main frontend (Angular 21+, Signals, Standalone). Uses Tailwind CSS 4.
  - `src/app`: Core application logic and components.
  - `src/styles.css`: Global styles including Tailwind imports.
- **apps/server**: Backend API (Fastify 5, Kysely, TypeBox). Connects to PostgreSQL and InfluxDB.
  - `src/controllers`: API route definitions.
  - `src/services`: Business logic layer.
  - `src/repository`: Database access layer (Kysely).
  - `src/schemas`: TypeBox validation schemas.
  - `src/plugins`: Fastify plugin registrations (DI, DB, etc.).
- **packages/sondehub**: Library for SondeHub integration.

## Monorepo Architecture
- **Turborepo**: Manages the build pipeline and caching. All scripts should ideally be run through `turbo` to benefit from caching.
- **PNPM Workspaces**: Handles local package dependencies.
- **Dependency Management**:
  - Cross-package dependencies use `workspace:^` in `package.json`.
  - Shared logic should be placed in `packages/`.
  - To add a dependency to a package: `pnpm --filter @gapp/<pkg> add <dep-name>`.
  - To run a script in a specific package: `pnpm --filter @gapp/<pkg> run <script>`.

## Development Commands

### General
- **Build All**: `pnpm turbo build`
- **Lint All**: `pnpm run lint` (uses Biome)
- **Fix Lint/Format**: `pnpm run lint:fix` (uses Biome)
- **Test All**: `pnpm turbo test`

### Apps & Packages
- **Server Dev**: `pnpm --filter @gapp/server run dev` (Uses native Node.js TS support)
- **Dashboard Dev**: `pnpm --filter @gapp/dashboard run dev`
- **Migrations**: `pnpm run create-migration <name>` (Creates a Kysely migration)

### Running Tests (Vitest)
The project uses **Vitest** for testing (even in Angular packages).

- **Run all tests in a package**:
  ```bash
  pnpm --filter @gapp/<pkg> run test
  ```
- **Run a single test file**:
  ```bash
  pnpm --filter @gapp/<pkg> exec vitest run <path/to/file.spec.ts>
  ```
- **Watch mode**:
  ```bash
  pnpm --filter @gapp/<pkg> exec vitest
  ```

## Code Style & Guidelines

### General & TypeScript
- **Linter/Formatter**: The project uses **Biome**. Run `pnpm run lint:fix` to auto-format.
- **Imports**: Use ES Modules.
  - In `@gapp/server`, use `.ts` extensions in imports (e.g., `import { app } from './app.ts'`).
- **Naming**:
  - `PascalCase` for Classes, Components, and Types.
  - `camelCase` for variables, methods, and file names (except Angular components).
  - `B_Prefix` for Body schemas, `R_Prefix` for Response schemas (e.g., `B_CreateVehicle`).
- **Types**: Avoid `any`. Use **TypeBox** for API schemas.

### Frontend (Angular 21+)
- **Standalone**: All components must be `standalone: true`.
- **Signals**: Use Signals for state management (`signal`, `computed`, `effect`). Avoid `BehaviorSubject` unless necessary.
- **Tailwind CSS 4**: Use utility classes directly in templates.
- **Templates**: Prefer separate `.html` and `.css` files. Use `protected readonly` for properties accessed in templates.
- **Component Structure**:
  ```typescript
  @Component({
    selector: 'app-feature',
    imports: [CommonModule],
    templateUrl: './feature.html',
    styleUrl: './feature.css',
  })
  export class FeatureComponent {
    protected readonly data = signal<string>('init');
  }
  ```

### Backend (Fastify 5)
- **Architecture**: Controller (Plugin) -> Service (Class) -> Repository (Class).
- **Dependency Injection**: Services and Repositories are decorated onto the Fastify instance via plugins.
- **Validation**: Define schemas using `@sinclair/typebox`.
- **Database**: Use `Kysely` for type-safe SQL. Follow existing patterns in `repositories/`.
- **Database Models**: Models are defined in `postgres-database.ts` using `Selectable`, `Insertable`, etc.
- **Error Handling**: Use `fastify-sensible` methods (e.g., `(rep as any).notFound()`). Wrap controller logic in `try-catch`.

#### Example Controller Pattern
```typescript
fastify.post('', { schema: { body: B_Schema, response: { 201: R_Schema } } }, async (req, rep) => {
  try {
    const result = await req.server.myService.doWork(req.body);
    rep.status(201).send(result);
  } catch (e) {
    req.server.log.error(e);
    return (rep as any).internalServerError('Description');
  }
});
```

## Security & Best Practices
- **No Secrets**: Never commit `.env` files or hardcoded credentials.
- **Type Safety**: Ensure database models in `postgres-database.ts` match migrations.
- **Testing**: Write Vitest specs for new logic in `packages/` and `apps/server`.

## Agent Instructions
- **Analysis**: Always read existing service/repository patterns before creating new ones.
- **Modifications**: When adding a field to a database entity, you must:
  1. Create a migration in `apps/server/src/migrations/`.
  2. Update the Kysely interface in `apps/server/src/repository/postgres-database.ts`.
  3. Update TypeBox schemas in `apps/server/src/schemas/`.
  4. Run `pnpm turbo build` to verify type consistency.
- **Verification**: After any change, run `pnpm run lint` and relevant tests.
- **Communication**: Be concise. Focus on technical accuracy and following project patterns.
