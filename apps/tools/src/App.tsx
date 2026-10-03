import { Route, Routes } from "react-router-dom";
import { ToolsLayout } from "./components/ToolsLayout";
import { ColorPickerPage } from "./pages/color-picker/ColorPickerPage";
import { ImageCompressorPage } from "./pages/image-compressor/ImageCompressorPage";
import { ImageEditorPage } from "./pages/image-editor/ImageEditorPage";
import { LegalPage } from "./pages/legal/LegalPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PdfEditorPage } from "./pages/pdf-editor/PdfEditorPage";
import { QrCodeGeneratorPage } from "./pages/qr-code-generator/QrCodeGeneratorPage";
import { SpinningWheelPage } from "./pages/spinning-wheel/SpinningWheelPage";
import { ToolsPage } from "./pages/ToolsPage";
import { LocaleProvider } from "./toolsLocale";

export default function App() {
	return (
		<LocaleProvider>
			<Routes>
				<Route element={<ToolsLayout />}>
					<Route path="/" element={<ToolsPage />} />
					<Route path="/pdf-editor" element={<PdfEditorPage />} />
					<Route path="/color-picker" element={<ColorPickerPage />} />
					<Route path="/qr-code-generator" element={<QrCodeGeneratorPage />} />
					<Route path="/spinning-wheel" element={<SpinningWheelPage />} />
					<Route path="/image-editor" element={<ImageEditorPage />} />
					<Route path="/image-compressor" element={<ImageCompressorPage />} />
					<Route
						path="/privacy-policy"
						element={<LegalPage kind="privacy" />}
					/>
					<Route
						path="/terms-of-service"
						element={<LegalPage kind="terms" />}
					/>
					<Route path="*" element={<NotFoundPage />} />
				</Route>
			</Routes>
		</LocaleProvider>
	);
}
