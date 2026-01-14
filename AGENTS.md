# AGENTS.md

## Purpose
- This file guides agentic coding assistants working in this repo.
- Update it as the project evolves (scripts, tooling, style, layout).
- Keep instructions concrete and aligned with actual tooling.

## Project Status
- Greenfield Node.js + TypeScript project.
- No existing Cursor or Copilot rules detected.
- If rules are added later, copy key guidance here.

## Quick Start
- Install deps: `npm install`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Tests: `npm run test`

## Commands (Required)
- `npm install`
  - Installs dependencies.
- `npm run build`
  - Compiles TypeScript to `dist/`.
- `npm run lint`
  - Runs ESLint checks.
- `npm run format`
  - Runs Prettier write mode.
- `npm run test`
  - Runs unit/integration tests.

## Commands (Single Test)
- By file path (Playwright):
  - `npm run test -- tests/mock-01-signal.spec.ts`
- By test name (Playwright):
  - `npm run test -- -g "test name"`
- Headed mode:
  - `npm run test -- --headed`

## Scripts Contract
- Keep `package.json` scripts consistent with commands above.
- If tools change (e.g., Vitest to Jest), update this file.
- Prefer `npm` over `yarn` or `pnpm` unless specified.

## Folder Conventions
- `src/` for runtime code.
- `tests/` for non-co-located tests (optional).
- `__tests__/` for co-located tests (optional).
- `dist/` for build output (gitignored).
- `scripts/` for tooling automation.
- `types/` for shared TS types (optional).

## TypeScript Configuration
- Use `strict: true` in `tsconfig.json`.
- Avoid `any`; prefer `unknown` and narrow.
- Use `noImplicitAny`, `noImplicitReturns`.
- Prefer `esModuleInterop` and `moduleResolution: Node`.
- Align target/module with runtime (Node 18+ recommended).

## Code Style (General)
- Prefer clarity over cleverness.
- Keep functions small and single-purpose.
- Early-return to reduce nesting.
- Avoid side effects in utilities.
- Favor pure functions when possible.

## Formatting
- Prettier is the source of truth for formatting.
- Use default Prettier style unless project config says otherwise.
- Do not hand-format; run `npm run format` when needed.

## Imports
- Order imports: Node built-ins, external, internal, relative.
- Separate groups with a blank line.
- Prefer absolute imports from `src/` if configured.
- Avoid deep relative chains like `../../../`.
- Do not import from `dist/`.

## Naming
- `camelCase` for variables/functions.
- `PascalCase` for classes/types/interfaces.
- `SCREAMING_SNAKE_CASE` for constants.
- File names use `kebab-case` or `camelCase` consistently.
- Boolean names use `is/has/should` prefixes.

## Types and Interfaces
- Prefer `type` for unions/aliases.
- Use `interface` for public object shapes where extension is needed.
- Export types from `src/types/` if shared across modules.
- Keep generics readable; avoid single-letter generic names.

## Error Handling
- Throw `Error` with clear messages.
- Use typed error classes only when needed.
- Avoid swallowing errors; bubble up or log.
- In async functions, catch only to add context.
- Return `Result`-like objects only by design decision.

## Logging
- Prefer a single logger abstraction (e.g., `pino`, `winston`).
- Do not use `console.log` in production code.
- Use `console.warn/error` only in scripts.

## Async Patterns
- Prefer `async/await` over chained `then`.
- Use `Promise.all` for parallel operations.
- Avoid unhandled promise rejections.
- Always `await` critical async calls.

## Testing Guidelines
- Tests live in `tests/` or `__tests__/`.
- Use `.test.ts` or `.spec.ts` naming.
- Keep unit tests fast and deterministic.
- Mock external IO (network, filesystem) where possible.
- Avoid brittle snapshot tests unless necessary.

## Linting Rules (Expectations)
- ESLint with TypeScript plugin.
- No unused vars/imports.
- No implicit `any` or unsafe casts.
- Prefer `const` over `let`.
- Enforce `eqeqeq`.

## Configuration Files
- `package.json` is the source for scripts.
- `tsconfig.json` controls compiler behavior.
- `.eslintrc.*` defines lint rules.
- `.prettierrc.*` defines formatting.
- `.editorconfig` optional but recommended.

## Dependency Management
- Pin versions for critical tooling.
- Avoid installing global deps for build/test.
- Use `npm ci` in CI when lockfile exists.
- Keep dev dependencies in `devDependencies`.

## Security
- Never commit secrets or tokens.
- Use `.env` for local config (gitignored).
- Sanitize user input at boundaries.
- Validate external data before use.

## Performance
- Avoid premature optimization.
- Measure before refactoring for speed.
- Prefer streaming APIs for large payloads.

## Documentation
- Keep README concise and accurate.
- Document public APIs in JSDoc if exported.
- Update AGENTS.md when tooling changes.

## Changes & Commits
- Keep changes minimal and focused.
- Avoid unrelated refactors in feature work.
- Write descriptive commit messages.

## Cursor and Copilot Rules
- No `.cursorrules` or `.cursor/rules/` detected.
- No `.github/copilot-instructions.md` detected.
- If added later, summarize key rules here.

## Checklist for Agents
- Verify scripts exist before running.
- Follow lint/format configs.
- Match existing code patterns.
- Update tests when behavior changes.
- Mention any non-run tests in summary.

## Questions to Ask
- Confirm desired Node version.
- Confirm test runner (Playwright).
- Confirm formatting and linting tools.
- Confirm repo layout preferences.
