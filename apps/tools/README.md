# Tools app

The public tools app is served at `/tools/`. For monorepo setup and GitHub Pages prerequisites, see the [root README](../../README.md).

## Structure

- `src/App.tsx` wires the locale provider and routes. `src/components/ToolsLayout.tsx` owns the shared header, route outlet, and footer. `src/pages/ToolsPage.tsx` owns the responsive tool grid; `src/pages/NotFoundPage.tsx` handles unknown routes.
- `src/toolCatalog.ts` is the single list of tools. Each entry has the route slug, the lucide icon shown on its landing card, card copy, SEO copy, and a lazy page loader. Routes, landing cards, About sections, meta tags, prerendered HTML, OG images, and the tools sitemap are all generated from it.
- Every tool page is lazy-loaded through `lazyPage` (`src/lazyPage.ts`). Only the landing, legal, and not-found pages are bundled eagerly. `src/main.tsx` preloads the current tool before the first render so prerendered HTML is not replaced by the loading fallback. The landing cards preload a tool on hover or focus. The test setup preloads every tool so tests can render routes synchronously.
- `src/components/ToolRoute.tsx` renders a tool page with `PageMeta` (title, description, canonical, Open Graph/Twitter tags, and `WebApplication` + `FAQPage` JSON-LD) and `ToolAbout` (the visible About, features, how-to, and FAQ section below the tool). Canonical URLs always use `https://boypanjaitan.com/tools`, without a trailing slash.
- Put each tool's page, translations, model, services, assets, and tests in `src/pages/<route-slug>/`. The PDF Editor is the example at `src/pages/pdf-editor/`.
- `src/shared/imageFiles.ts` holds image helpers used by more than one tool: accepted types and limits, output formats and names, Canvas encoding with unsupported-format detection, and downloads. `src/components/NumberField.tsx` is the shared number input. `src/shared/clipboard.ts` and `src/shared/download.ts` hold the copy and download helpers. Move code there only when a second tool needs it.

## Adding a tool

Every new tool must complete all of these steps:

1. Create `src/pages/<slug>/` with the page component, `locale.ts`, and tests. Do not set `document.title` in the page; `ToolRoute` owns the meta tags.
2. In `locale.ts`, export `<tool>Card` (`name`, `description`) and `<tool>Seo` (`satisfies ToolSeoCopy` from `src/toolSeo.ts`) in EN and ID. Write the SEO copy from the tool's real behavior and limits. Do not claim features the tool does not have.
   - `metaTitle`: a search-friendly title with the main keywords, without the site suffix.
   - `metaDescription`: 110–170 characters. `src/toolCatalog.test.tsx` enforces this range.
   - `about`: 1–2 paragraphs. `features`: at least 4 bullets. `steps`: exactly 3. `faq`: at least 3 Q&A pairs covering privacy, limits, and supported formats.
3. Register the tool in `src/toolCatalog.ts` with its slug, the lucide icon for its landing card (the OG image uses the same icon), card, SEO copy, and `lazyPage(() => import("./pages/<slug>/<Page>"), "<Page>")`. Never import a tool page statically.
4. In `scripts/test-pages-smoke.sh`, add the slug to the 404 redirect cases and to the prerender loop.
5. Add a section for the tool to this README. Cover navigation, direct access, and both languages in tests; `src/toolCatalog.test.tsx` covers the About section and meta tags for every catalog entry automatically.
6. Run `pnpm --filter @portfolio/tools build:pages`. Check `dist/<slug>.html` for the content and meta tags, and view `dist/og/<slug>.png`.

## Prerender and Open Graph images

`pnpm --filter @portfolio/tools build:pages` runs the normal build and then `scripts/prerender.mjs`. The script loads `src/toolCatalog.ts` through Vite, so it never duplicates the tool list. It then:

- renders each tool's card icon with `react-dom/server` and screenshots a 1200×630 template (icon tile, English name and card description, theme colors, and fonts from `@portfolio/config` and Fontsource) to `dist/og/<slug>.png`, plus `dist/og/tools.png` for the landing page. The build fails if a title or description overflows the image.
- serves `dist` at `/tools/`, opens each page in Chrome with the English locale, and waits for `main h1`, the About section on tool pages, and the expected canonical link. It writes `dist/index.html` for the landing page and `dist/<slug>.html` for the others.
- writes `dist/sitemap.xml` with every prerendered URL.

The script needs Chrome from Puppeteer: `pnpm --filter @portfolio/tools exec puppeteer browsers install chrome`. Plain `build` does not prerender, so CI checks do not need Chrome.

## Shared contracts

- Keep EN/ID tool copy in the tool's own translation module, with matching keys checked by TypeScript. `src/toolsLocale.tsx` owns the shared navigation, landing page, and not-found copy and the `portfolio-locale` preference shared with home.
- Preserve the `/tools/` Vite base path and React Router basename. GitHub Pages redirects direct tool URLs through the root `404.html`; `src/main.tsx` restores the URL before routing. Check the fallback when changing routes or asset paths.
- Keep the shared header sticky above page content. Align its inner content and the shared footer to the same `max-w-7xl` width and horizontal padding; keep dialogs above the header.

## PDF Editor

`/tools/pdf-editor` combines PDFs and lets users reorder, rotate, select, or remove pages. Users can add text, PNG/JPEG images, and drawn signatures, then position or resize them. Exporting all pages or selected pages downloads one PDF. Signatures are page images, not certified digital signatures.

PDF.js renders previews and pdf-lib creates the download; files are processed in the browser. Preview zoom starts at 100% of the fit-to-preview size, ranges from 50% to 300% in 25% steps, and persists when switching pages. Annotation coordinates stay in the original PDF page space so the export matches the preview. The editor does not open encrypted PDFs or support editing existing text, filling forms, or OCR.

## Images to PDF

`/tools/image-to-pdf` combines up to 30 PNG, JPEG, or WebP images into one PDF, with one image per page. Users can add images by file picker or drag and drop, preview them, change their order, and remove them before downloading. Each input is limited to 50 MB, 50 megapixels, and 16,384 pixels on either side. Images are decoded with EXIF orientation applied, then drawn from pixels, so source metadata is not copied into the PDF.

The default A4 page size and optional Letter size follow each image's portrait or landscape orientation. Images fit without cropping inside a 10 mm white margin. The match-image-ratio option uses a page with the image's aspect ratio and an A4-length longest side. Embedded image resolution is capped at 300 DPI at its displayed size. Everything is processed in the browser, and a failed image prevents a partial PDF download.

## Color Picker

`/tools/color-picker` reads one pixel from an uploaded PNG, JPEG, or WebP image in the browser. Hover or touch movement previews its HEX, RGB, and opacity; clicking or releasing a touch selects a color for copying. Fully transparent pixels show their opacity without a copyable HEX or RGB value. The tool does not sample other parts of the screen or extract a palette.

## QR Code Generator

`/tools/qr-code-generator` converts text or a URL into a QR code entirely in the browser, preserving the input exactly. Users can choose foreground and background colors, Square/Rounded/Dots data-module styles, and download a 256, 512, 1024, or 2048 px PNG or SVG. Functional modules stay square and the four-module quiet zone remains clear. The preview updates as they type and shares its geometry with both export formats.

Users can add, replace, or remove one local PNG, JPEG, or WebP center logo up to 10 MB. The logo keeps its aspect ratio inside a background-colored badge sized from 10% to 25% of the QR symbol. It is normalized to an embedded PNG so exported SVGs are self-contained. Error correction is M without a logo and H with one; content that no longer fits cannot be downloaded. Low or inverted contrast shows a warning, and users are prompted to test decorative codes before sharing. The tool does not provide Wi-Fi or contact presets or saved history.

## Spinning Wheel

`/tools/spinning-wheel` draws one item at a time from an editable list. Users can add items individually or open a collapsed panel to add one per line, edit names, remove items, and choose each item's color. Names must be unique after trimming and case folding. Each remaining item has one equal-sized wheel slice; after a spin, the winner appears in a confetti dialog and remains on the wheel until the user confirms removal. The last item can also be drawn. The list and colors are saved in this browser's local storage. An unconfirmed result is not saved, so reloading the page keeps that item in the list. The tool does not use an account, server, or saved winner history.

## Image Editor

`/tools/image-editor` opens one local PNG, JPEG, or WebP image up to 50 MB and 50 megapixels. Users can rotate it in 90° steps, flip it horizontally or vertically, and straighten it from -45° to 45°. Rotation and flip buttons act on the image as shown, even after a flip. Changing the rotation or angle resets the crop to the largest area without empty corners; flips mirror the current crop. The crop can be dragged, resized from eight handles, moved with the arrow keys, or set in pixels, with Free, Original, 1:1, 4:3, 3:2, and 16:9 ratios oriented like the image.

The image is decoded with its EXIF orientation applied, so the preview starts upright. A dependency-free reader in `imageMetadata.ts` lists camera, lens, software, date, artist, copyright, and GPS details plus EXIF, XMP, IPTC, ICC, and text blocks; it only reports and never edits the source. Downloads redraw the crop on a canvas through the same `drawTransformed` geometry as the preview and encode PNG, JPEG, or WebP (quality 10–100%, default 92%), so no source metadata is copied. The page then reads the new file and confirms that no identifying metadata was found. Colors are converted to sRGB and ICC profiles are dropped. JPEG fills empty or transparent areas with white. If the browser cannot encode the chosen format, the download is refused with an error. The tool does not resize, filter, batch-process, or open HEIC or other formats.

## Image Compressor & Converter

`/tools/image-compressor` processes up to 30 local PNG, JPEG, or WebP images, each up to 50 MB and 50 megapixels. One set of settings applies to every image: keep the original format or convert to PNG, JPEG, or WebP; choose JPEG/WebP quality from 10% to 100% (default 92%); and resize by percentage, width and height, or longest side. Width and height can keep the ratio, fitting inside both sides, or stretch to exact sides; a blank side is derived from the other. Images are not enlarged unless the user allows it. Large reductions are halved in steps before the final draw to reduce aliasing.

An optional maximum size in KB applies to JPEG and WebP. The encoder binary-searches quality between 10% and the chosen quality, then shrinks dimensions by 15% per step, up to six times, if the lowest quality is still too large. When nothing fits, the smallest result is kept and marked. PNG is lossless, so only resizing makes it smaller. JPEG fills transparent areas with white.

Compression runs only when the user presses Compress, one image at a time; changed settings mark existing results as outdated. Each row shows the original and result sizes and flags results larger than the original. Users can download each image or, with two or more results, one ZIP. `zipWriter.ts` is a dependency-free store-only ZIP writer with UTF-8 names and deduplicated file names. Like the Image Editor, results are drawn from decoded pixels with EXIF orientation applied, so metadata is not included. The tool does not open HEIC, AVIF, or GIF files, apply per-image settings, or keep files after the page closes.

## Data Formatter & Converter

`/tools/data-formatter` has two tabs whose input is kept while switching. Both use CodeMirror 6 editors with line numbers, folding, search, and error markers; Tab is left to the browser so keyboard users can leave an editor. Like every tool, the page is lazy-loaded, so CodeMirror and the `yaml` package download only when the tool opens. Text can be pasted, opened from a file up to 5 MB, or dropped on an editor. Nothing is saved.

**Format & validate** tidies and checks data without changing its format. It auto-detects JSON, YAML, or XML from the file extension or first character, or uses the chosen format, and validates 300 ms after typing stops. Errors show the line and column in the status and editor.
- JSON uses the tool's own strict RFC 8259 scanner (`jsonFormat.ts`), so its errors are localized and identical in every browser. Format and Minify re-print tokens, keeping number literals, escapes, key order, and duplicate keys exactly. Duplicate keys are listed as notes. Sort keys parses the value and warns when numbers would be rounded or become null; so do conversions.
- YAML uses `yaml` with all documents in a stream. Formatting keeps comments and writes numbers, booleans, and nulls from their source text (for example `0x1F`, `1e3`, `~`). YAML cannot be indented with tabs, so tab indentation uses 2 spaces.
- XML is validated by the browser's `DOMParser`; its error text differs by engine and is parsed for Chrome/Safari, Firefox, and jsdom. The formatter keeps text-only content, mixed content, and `xml:space="preserve"` verbatim, and Minify only removes whitespace between tags. XML is not converted to other formats because there is no single standard mapping.

**Convert** converts live in four directions: CSV → JSON, JSON → CSV, JSON → YAML, and YAML → JSON. Opening a file picks the direction from its extension (`.csv`/`.tsv`, `.yaml`/`.yml`, or `.json`, which keeps a JSON-input direction). Swap moves the output into the input and reverses the direction. CSV → JSON uses an RFC 4180 parser (`csv.ts`) with quoted fields, line breaks inside quotes, BOM removal, and delimiter detection among comma, semicolon, tab, and pipe. A header row becomes object keys; blank or repeated headers are renamed. Optional type detection converts plain numbers that JavaScript can store exactly, `true`/`false`, and `null`, while values such as `007` stay text. Rows with a different field count are listed as notes. JSON → CSV accepts an array of objects (columns in first-seen order), an array of arrays, an array of values, or one object; nested values are flattened to `a.b`/`a.0` or written as JSON text. YAML → JSON returns an array for multi-document streams and refuses excessive alias expansion; JSON → YAML offers only space indentation.

## Legal pages

`/tools/privacy-policy` and `/tools/terms-of-service` are available in EN/ID from the shared footer on every Tools page. They apply only to Tools. The privacy page explains local processing, the saved language and Spinning Wheel preferences, and the network requests needed to load the site from GitHub Pages. Both pages link to the separate portfolio contact form and explain that submitting it sends the entered details to the contact service.

## Verification

Run these workspace checks from the repository root after changing tools code:

```bash
pnpm --filter @portfolio/tools format:check
pnpm --filter @portfolio/tools lint
pnpm --filter @portfolio/tools test
pnpm --filter @portfolio/tools build
```

When changing routes, the base path, built asset paths, the Pages fallback, SEO copy, or `scripts/prerender.mjs`, also run `pnpm --filter @portfolio/tools build:pages` and `pnpm test:pages:smoke` as described in the root README. For PDF preview or export changes, verify an uploaded PDF and the downloaded result in a production build, including annotation placement and font loading.
