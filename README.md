# SVG Fixer

A minimal, local-first website that optimizes SVG icons using [SVGO](https://github.com/svg/svgo) right in the browser.

It applies the same optimizations described in the reference `svgo.config.mjs`:

- `preset-default`
- `removeAttrs` — strips hardcoded `fill` so colors can be customized
- `addAttributesToSVGElement` — adds `fill="currentColor"` and `aria-hidden="true"`
- `removeDimensions` — drops `width`/`height` for responsive sizing

## Getting started

```bash
npm install
npm run dev
```

Then open the URL that Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## How it works

The app is a single-page Vite + React + TypeScript UI. Uploaded SVG files are
read with the `File` API and passed to SVGO's `optimize()` function. Nothing is
uploaded to a server — all processing happens on the client.
