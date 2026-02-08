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
- **packages/ui**: Shared Angular component library.
- **apps/gapp-dashboard & libs/**: Legacy NX packages (DO NOT modify unless requested). These are being phased out in favor of the new structure.

## Monorepo Architecture
- **Turborepo**: Manages the build pipeline and caching. All scripts should ideally be run through `turbo` to benefit from caching, e.g., `pnpm turbo build`.
- **PNPM Workspaces**: Handles local package dependencies. The workspace configuration is defined in `pnpm-workspace.yaml`.
- **Dependency Management**: 
  - Cross-package dependencies use `workspace:^` in `package.json`.
  - Shared logic should be placed in `packages/`.
  - UI components go into `packages/ui`.
  - To add a dependency to a package: `pnpm --filter @gapp/<pkg> add <dep-name>`.
  - To run a script in a specific package: `pnpm --filter @gapp/<pkg> run <script>`.

## Legacy Packages (DO NOT MODIFY)
The following directories contain legacy NX code that is being phased out:
- `apps/gapp-dashboard`
- `libs/forms-ui`
- `libs/ui`
Do not modify these unless explicitly requested. All new development should happen in the new `apps/` and `packages/` structure.

### General
- **Build All**: `pnpm turbo build`
- **Lint All**: `pnpm turbo lint`
- **Test All**: `pnpm turbo test`
- **Install Dependency**: `pnpm --filter @gapp/<pkg> add <name>`

### Apps & Packages
- **Server Dev**: `pnpm --filter @gapp/server run dev` (Uses native Node.js TS support)
- **Dashboard Dev**: `pnpm --filter @gapp/dashboard run dev`
- **Migrations**: `pnpm run create-migration <name>` (Creates a Kysely migration)

### Running Tests
The project uses **Vitest** for testing (even in Angular packages).
- **Run all tests in package**: `pnpm --filter @gapp/<pkg> run test`
- **Run single test file**: `pnpm --filter @gapp/<pkg> exec vitest run <path/to/file.spec.ts>`
- **Watch mode**: `pnpm --filter @gapp/<pkg> exec vitest`

## Code Style & Guidelines

### TypeScript & General
- **Formatting**: Adhere to Prettier config. Run `pnpm turbo lint` to check.
- **Imports**: Use ES Modules. In `@gapp/server`, use `.ts` extensions in imports.
- **Naming**: 
  - `PascalCase` for Classes, Components, and Types.
  - `camelCase` for variables, methods, and file names (except components).
  - `B_Prefix` for Body schemas, `R_Prefix` for Response schemas (e.g., `B_CreateVehicle`).
- **Types**: Avoid `any` where possible. Use TypeBox for API schemas.

### Frontend (Angular 21+)
- **Standalone**: All components must be `standalone: true` (default in v19+).
- **Signals**: Use Signals for state management (`signal`, `computed`, `effect`). Avoid `BehaviorSubject` unless necessary for legacy interop.
- **Tailwind CSS 4**: The project uses Tailwind 4. Use utility classes directly in templates.
- **Templates**: Prefer separate `.html` and `.css` files. Use `protected readonly` for properties accessed in templates.
- **Component Structure**:
  ```typescript
  @Component({
    selector: 'app-feature',
    imports: [CommonModule, SharedComponent],
    templateUrl: './feature.html',
    styleUrl: './feature.css',
  })
  export class FeatureComponent {
    protected readonly data = signal<string>('init');
  }
  ```

### Backend (Fastify 5)
- **Architecture**: Controller (Plugin) -> Service (Class) -> Repository (Class).
- **Dependency Injection**: Services and Repositories are decorated onto the Fastify instance. See `apps/server/src/plugins/services.ts` and `repositories.ts`.
- **Validation**: Define schemas using `@sinclair/typebox`.
- **Database**: Use `Kysely` for type-safe SQL. Follow existing patterns in `repositories/`.
- **Database Models**: Models are defined in `postgres-database.ts` using `Selectable`, `Insertable`, etc.
- **Error Handling**: Use `fastify-sensible` methods via `(rep as any).notFound()`, `internalServerError()`, etc. Wrap controller logic in `try-catch`.

### Example Controller Pattern
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
- **Verification**: After any change, run `pnpm turbo lint` and relevant tests.
- **Communication**: Be concise. Focus on technical accuracy and following project patterns.
