# Tools app

The public tools app is served at `/tools/`. For monorepo setup and GitHub Pages prerequisites, see the [root README](../../README.md).

## Structure and adding a tool

- `src/App.tsx` wires the locale provider and routes. `src/components/ToolsLayout.tsx` owns the shared header and route outlet. `src/pages/ToolsPage.tsx` owns the responsive tool grid and landing page footer; `src/pages/NotFoundPage.tsx` handles unknown routes.
- Put each tool's page, translations, model, services, assets, and tests in `src/pages/<route-slug>/`. The PDF Editor is the example at `src/pages/pdf-editor/`.
- To add a tool, create its folder, register its route in `App.tsx`, and add a card in `ToolsPage.tsx`. Keep the card's name and description in that tool's translation module. Cover navigation, direct access, and both languages in tests.

## Shared contracts

- Keep EN/ID tool copy in the tool's own translation module, with matching keys checked by TypeScript. `src/toolsLocale.tsx` owns the shared navigation, landing page, and not-found copy and the `portfolio-locale` preference shared with home.
- Preserve the `/tools/` Vite base path and React Router basename. GitHub Pages redirects direct tool URLs through the root `404.html`; `src/main.tsx` restores the URL before routing. Check the fallback when changing routes or asset paths.
- Keep the shared header sticky above page content. Align its inner content and the landing page footer to the same `max-w-7xl` width and horizontal padding; keep dialogs above the header.

## PDF Editor

`/tools/pdf-editor` combines PDFs and lets users reorder, rotate, select, or remove pages. Users can add text, PNG/JPEG images, and drawn signatures, then position or resize them. Exporting all pages or selected pages downloads one PDF. Signatures are page images, not certified digital signatures.

PDF.js renders previews and pdf-lib creates the download; files are processed in the browser. Preview zoom starts at 100% of the fit-to-preview size, ranges from 50% to 300% in 25% steps, and persists when switching pages. Annotation coordinates stay in the original PDF page space so the export matches the preview. The editor does not open encrypted PDFs or support editing existing text, filling forms, or OCR.

## Color Picker

`/tools/color-picker` reads one pixel from an uploaded PNG, JPEG, or WebP image in the browser. Hover or touch movement previews its HEX, RGB, and opacity; clicking or releasing a touch selects a color for copying. Fully transparent pixels show their opacity without a copyable HEX or RGB value. The tool does not sample other parts of the screen or extract a palette.

## QR Code Generator

`/tools/qr-code-generator` converts text or a URL into a QR code entirely in the browser, preserving the input exactly. Users can choose foreground and background colors, Square/Rounded/Dots data-module styles, and download a 256, 512, 1024, or 2048 px PNG or SVG. Functional modules stay square and the four-module quiet zone remains clear. The preview updates as they type and shares its geometry with both export formats.

Users can add, replace, or remove one local PNG, JPEG, or WebP center logo up to 10 MB. The logo keeps its aspect ratio inside a background-colored badge sized from 10% to 25% of the QR symbol. It is normalized to an embedded PNG so exported SVGs are self-contained. Error correction is M without a logo and H with one; content that no longer fits cannot be downloaded. Low or inverted contrast shows a warning, and users are prompted to test decorative codes before sharing. The tool does not provide Wi-Fi or contact presets or saved history.

## Spinning Wheel

`/tools/spinning-wheel` draws one item at a time from an editable list. Users can add items individually or open a collapsed panel to add one per line, edit names, remove items, and choose each item's color. Names must be unique after trimming and case folding. Each remaining item has one equal-sized wheel slice; after a spin, the winner appears in a confetti dialog and remains on the wheel until the user confirms removal. The last item can also be drawn. The list and colors are saved in this browser's local storage. An unconfirmed result is not saved, so reloading the page keeps that item in the list. The tool does not use an account, server, or saved winner history.

## Verification

Run these workspace checks from the repository root after changing tools code:

```bash
pnpm --filter @portfolio/tools format:check
pnpm --filter @portfolio/tools lint
pnpm --filter @portfolio/tools test
pnpm --filter @portfolio/tools build
```

When changing routes, the base path, built asset paths, or the Pages fallback, run `pnpm test:pages:smoke` as described in the root README. For PDF preview or export changes, verify an uploaded PDF and the downloaded result in a production build, including annotation placement and font loading.
