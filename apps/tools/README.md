# Tools app

The public tools app is served at `/tools/`. For monorepo setup and GitHub Pages prerequisites, see the [root README](../../README.md).

## Structure and adding a tool

- `src/App.tsx` wires the locale provider and routes. `src/components/ToolsLayout.tsx` owns the shared header, route outlet, and footer. `src/pages/ToolsPage.tsx` owns the responsive tool grid; `src/pages/NotFoundPage.tsx` handles unknown routes.
- Put each tool's page, translations, model, services, assets, and tests in `src/pages/<route-slug>/`. The PDF Editor is the example at `src/pages/pdf-editor/`.
- `src/shared/imageFiles.ts` holds image helpers used by more than one tool: accepted types and limits, output formats and names, Canvas encoding with unsupported-format detection, and downloads. `src/components/NumberField.tsx` is the shared number input. Move code there only when a second tool needs it.
- To add a tool, create its folder, register its route in `App.tsx`, and add a card in `ToolsPage.tsx`. Keep the card's name and description in that tool's translation module. Cover navigation, direct access, and both languages in tests.

## Shared contracts

- Keep EN/ID tool copy in the tool's own translation module, with matching keys checked by TypeScript. `src/toolsLocale.tsx` owns the shared navigation, landing page, and not-found copy and the `portfolio-locale` preference shared with home.
- Preserve the `/tools/` Vite base path and React Router basename. GitHub Pages redirects direct tool URLs through the root `404.html`; `src/main.tsx` restores the URL before routing. Check the fallback when changing routes or asset paths.
- Keep the shared header sticky above page content. Align its inner content and the shared footer to the same `max-w-7xl` width and horizontal padding; keep dialogs above the header.

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

## Image Editor

`/tools/image-editor` opens one local PNG, JPEG, or WebP image up to 50 MB and 50 megapixels. Users can rotate it in 90° steps, flip it horizontally or vertically, and straighten it from -45° to 45°. Rotation and flip buttons act on the image as shown, even after a flip. Changing the rotation or angle resets the crop to the largest area without empty corners; flips mirror the current crop. The crop can be dragged, resized from eight handles, moved with the arrow keys, or set in pixels, with Free, Original, 1:1, 4:3, 3:2, and 16:9 ratios oriented like the image.

The image is decoded with its EXIF orientation applied, so the preview starts upright. A dependency-free reader in `imageMetadata.ts` lists camera, lens, software, date, artist, copyright, and GPS details plus EXIF, XMP, IPTC, ICC, and text blocks; it only reports and never edits the source. Downloads redraw the crop on a canvas through the same `drawTransformed` geometry as the preview and encode PNG, JPEG, or WebP (quality 10–100%, default 92%), so no source metadata is copied. The page then reads the new file and confirms that no identifying metadata was found. Colors are converted to sRGB and ICC profiles are dropped. JPEG fills empty or transparent areas with white. If the browser cannot encode the chosen format, the download is refused with an error. The tool does not resize, filter, batch-process, or open HEIC or other formats.

## Image Compressor & Converter

`/tools/image-compressor` processes up to 30 local PNG, JPEG, or WebP images, each up to 50 MB and 50 megapixels. One set of settings applies to every image: keep the original format or convert to PNG, JPEG, or WebP; choose JPEG/WebP quality from 10% to 100% (default 92%); and resize by percentage, width and height, or longest side. Width and height can keep the ratio, fitting inside both sides, or stretch to exact sides; a blank side is derived from the other. Images are not enlarged unless the user allows it. Large reductions are halved in steps before the final draw to reduce aliasing.

An optional maximum size in KB applies to JPEG and WebP. The encoder binary-searches quality between 10% and the chosen quality, then shrinks dimensions by 15% per step, up to six times, if the lowest quality is still too large. When nothing fits, the smallest result is kept and marked. PNG is lossless, so only resizing makes it smaller. JPEG fills transparent areas with white.

Compression runs only when the user presses Compress, one image at a time; changed settings mark existing results as outdated. Each row shows the original and result sizes and flags results larger than the original. Users can download each image or, with two or more results, one ZIP. `zipWriter.ts` is a dependency-free store-only ZIP writer with UTF-8 names and deduplicated file names. Like the Image Editor, results are drawn from decoded pixels with EXIF orientation applied, so metadata is not included. The tool does not open HEIC, AVIF, or GIF files, apply per-image settings, or keep files after the page closes.

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

When changing routes, the base path, built asset paths, or the Pages fallback, run `pnpm test:pages:smoke` as described in the root README. For PDF preview or export changes, verify an uploaded PDF and the downloaded result in a production build, including annotation placement and font loading.
