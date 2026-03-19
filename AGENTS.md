# AGENTS.md — dataSPA Contributor Guide for AI Coding Agents

dataSPA is a friendly fork of [Datastar](https://data-star.dev/) that restores plugins
removed from the Datastar beta. The TypeScript library lives in `library/`, end-to-end
tests (Playwright + Go server) live in `tests/`, and multi-language SDK stubs live in `sdk/`.

---

## Repository Structure

```
library/      TypeScript source + esbuild bundles
tests/        Playwright e2e specs + Go SSE test server
sdk/          Multi-language SDK implementations (Go, Python, Ruby, Rust, …)
tools/        VS Code extension, IntelliJ plugin
bundles/      Built JS bundles (output, not source)
```

---

## Build Commands

The build system uses the [`task`](https://taskfile.dev) CLI (`Taskfile.yml` at the root).

```bash
# Build the library and produce all bundles into bundles/
task library

# Equivalent manual steps (run from library/)
pnpm i
pnpm build
# Then esbuild is called per-bundle (see Taskfile.yml for full flags)
```

The library uses **pnpm** as its package manager. The `tests/` directory uses **npm**.

---

## Lint / Format Commands

Linting and formatting are handled by **[Biome](https://biomejs.dev/)** (no ESLint, no Prettier).

```bash
# From the repo root (applies to library/**/*.ts)
npx biome check .
npx biome check --write .    # auto-fix

# Or from library/
pnpm biome check src/
pnpm biome check --write src/
```

Biome is the single source of truth for both linting and formatting. The VS Code default
formatter for TypeScript and JSON is set to `biomejs.biome` in `.vscode/settings.json`.

---

## Test Commands

Tests are Playwright e2e tests. The test runner starts a Go HTTP/SSE server automatically.

```bash
# Run from tests/
cd tests

# Run all tests (default bundle: datastar.js)
npm test

# Run all tests with the aliased bundle
npm run test:aliased

# Run a single spec file
npx playwright test specs/on_click.spec.ts

# Run a single test by title (substring match)
npx playwright test --grep "should show element"

# Run tests with the Playwright UI
npm run test:ui

# Install Chromium if needed (first time)
npm run install:browsers
```

The Go test server is started automatically by `playwright.config.ts` via `webServer`.
Set the `BUNDLE` env var to override which bundle file is loaded:
```bash
BUNDLE=datastar-core npx playwright test
```

Go tests (SDK server code) are run from `tests/server/`:
```bash
cd tests/server
go test ./...
```

---

## Code Style Guidelines

### General

- **Language**: TypeScript with `strict: true`, target ES2021, ESNext modules.
- **Formatter**: Biome — 2-space indent, LF line endings, 80-char line width.
- **Quotes**: Single quotes for strings (`'like this'`).
- **Semicolons**: Omitted (Biome `"semicolons": "asNeeded"`).
- **Trailing commas**: Always in multi-line arrays, objects, and function parameters.
- **Arrow function parens**: Always include: `(x) => x`, not `x => x`.

### Imports

- Use **path aliases** in `library/src/` — never relative `../../` traversal:
  - `@engine` → `library/src/engine/engine.ts`
  - `@engine/*` → `library/src/engine/*`
  - `@plugins/*` → `library/src/plugins/*`
  - `@utils/*` → `library/src/utils/*`
- Use `import type { Foo }` for type-only imports.
- Plugin files are **side-effect imports** — each file calls its registration function
  (`attribute()`, `action()`, `watcher()`) at module scope with no default export.
- Biome's `organizeImports` is enabled — imports are auto-sorted on save/check.

### Naming Conventions

| Context | Convention |
|---|---|
| Variables, functions | `camelCase` |
| Types, interfaces, enums | `PascalCase` |
| Constants | `UPPER_SNAKE_CASE` (for module-level string/number literals) |
| Internal reactive state fields | trailing underscore: `deps_`, `value_`, `flags_` |
| File names | `camelCase.ts` (e.g. `jsonSignals.ts`, `onInterval.ts`) |

### Types

- Always prefer explicit types on function parameters and return values in public APIs.
- Use `type` aliases (not `interface`) for object shapes unless extension is needed.
- `noExplicitAny` is disabled — `any` may be used when necessary, but prefer specificity.
- `noNonNullAssertion` is disabled — `!` assertions are allowed but should be justified.
- Use `@ts-expect-error` (with a comment explaining why) instead of `@ts-ignore`.

### Plugin Pattern

Each plugin file in `library/src/plugins/` follows this pattern:

```typescript
import { attribute } from '@engine'         // or action / watcher
import { effect } from '@engine/signals'

attribute({
  name: 'show',
  requirement: { key: 'denied', value: 'must' },
  returnsValue: true,
  apply({ el, rx, error }) {
    // setup — return cleanup fn if needed
    return () => { /* teardown */ }
  },
})
```

Plugins register themselves at module scope. No default exports. No class-based patterns.

### Error Handling

Errors are reported via the **passed-in `error` function** on context objects, not via
`throw` at the call site:

```typescript
apply({ el, error }) {
  if (!el.id) throw error('MissingId', { el })
}
```

- `error(name: string, ctx?: Record<string, any>)` returns an `Error` — callers `throw` it.
- Never swallow errors silently.
- Use `// biome-ignore lint/<rule>: <reason>` for intentional lint suppressions.

### Exports

- **No `export default`** — all exports are named.
- Bundle entry points (`library/src/bundles/*.ts`) import plugins as side effects and
  re-export the public engine API.

---

## PR & LLM Policy

Per `.github/pull_request_template.md`:

> Pull requests containing LLM generated content **must** include:
> 1. A clear statement that the content was generated by an LLM.
> 2. The prompt used to generate the content.
> 3. A clear explanation of how the generated content was reviewed for accuracy.
>
> Failure to do so will result in the PR being closed without review.

- PRs to `main` are blocked by CI; target `develop` or a feature branch instead.
- Include a Problem Statement, Proposed Solution, and Alternatives Considered in all PRs.

---

## Key Files

| File | Purpose |
|---|---|
| `biome.json` | Linting + formatting config (source of truth) |
| `library/tsconfig.json` | TypeScript config for the library |
| `Taskfile.yml` | Build orchestration (`task library`) |
| `tests/playwright.config.ts` | Playwright config; starts Go web server |
| `tests/package.json` | Test scripts |
| `library/src/engine/types.ts` | Core type definitions |
| `library/src/engine/engine.ts` | Plugin registration API (`attribute`, `action`, `watcher`) |
| `library/src/globals.d.ts` | Global `ALIAS` declaration (injected at build time) |
