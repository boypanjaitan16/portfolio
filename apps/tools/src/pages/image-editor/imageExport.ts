import {
	canvasToBlob,
	ExportError,
	type ExportFormat,
} from "../../shared/imageFiles";
import {
	type CropRect,
	drawTransformed,
	type Size,
	type Transform,
} from "./imageTransformModel";

/**
 * Re-encodes the visible pixels into a new file. Nothing from the source file
 * is copied, so EXIF, GPS, XMP, IPTC, ICC, and text metadata are left behind.
 */
export function exportImage(
	image: CanvasImageSource,
	source: Size,
	transform: Transform,
	crop: CropRect,
	format: ExportFormat,
	quality: number,
): Promise<Blob> {
	const canvas = document.createElement("canvas");
	canvas.width = crop.width;
	canvas.height = crop.height;
	const context = canvas.getContext("2d", { colorSpace: "srgb" });
	if (!context) return Promise.reject(new ExportError("exportFailed"));
	if (format === "image/jpeg") {
		// JPEG has no transparency; empty straightened corners become white.
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, crop.width, crop.height);
	}
	context.imageSmoothingEnabled = true;
	context.imageSmoothingQuality = "high";
	drawTransformed(context, image, source, transform, crop);
	return canvasToBlob(canvas, format, quality);
}
