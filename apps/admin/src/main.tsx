import { StyleProvider } from "@ant-design/cssinjs";
import { adminAntdTheme, applyPortfolioTheme } from "@portfolio/config";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource-variable/instrument-sans";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element was not found.");

applyPortfolioTheme();

const redirect = new URLSearchParams(window.location.search).get("__redirect");
if (redirect?.startsWith("/admin/")) {
	window.history.replaceState(null, "", redirect);
}

createRoot(root).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<StyleProvider layer>
				<ConfigProvider theme={adminAntdTheme} locale={enUS}>
					<BrowserRouter basename="/admin">
						<App />
					</BrowserRouter>
				</ConfigProvider>
			</StyleProvider>
		</QueryClientProvider>
	</StrictMode>,
);
