# Task 13b Fix Report — WCAG 2.4.1 / 1.3.1 Skip Link / Main Landmark

## What Changed

Three surgical edits to ensure exactly one `<main id="contenu">` exists in the rendered tree for every route, provided by the root layout.

### `src/app/layout.tsx`
- Wrapped `{children}` in `<main id="contenu">{children}</main>` inside `<AppProviders>`.
- `<Header />` and `<Footer />` remain siblings of `<main>`, not inside it.

### `src/app/page.tsx`
- Removed the `<main id="contenu">…</main>` wrapper that enclosed the home page sections.
- `<JsonLd />` and all section components are now direct children of the fragment — the layout's `<main>` provides the landmark.

### `src/app/not-found.tsx`
- Changed `<main id="contenu" className="flex min-h-svh …">` to `<div className="flex min-h-svh …">`.
- All className values preserved exactly; only the element tag and `id` attribute were removed.

## Grep Result — Single `<main id="contenu">`

```
src/app/layout.tsx:100:          <main id="contenu">{children}</main>
```

No other file under `src/app` contains `id="contenu"` or a `<main` tag.

## Verification Results

| Check         | Result  |
|---------------|---------|
| `npm run typecheck` | PASS (no errors) |
| `npm run lint`      | PASS (no ESLint warnings or errors) |
| `npm run build`     | PASS — 24/24 static pages generated, compiled successfully in 10.8s |

All 24 routes including the 11 Etape-8 pages now receive the `<main id="contenu">` landmark from the layout. The skip link in the root layout correctly targets this landmark on every route.
