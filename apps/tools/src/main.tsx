import { applyPortfolioTheme } from "@portfolio/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { findToolByPath } from "./toolCatalog";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource-variable/instrument-sans";
import "./index.css";

const queryClient = new QueryClient();

applyPortfolioTheme();

const redirect = new URLSearchParams(window.location.search).get("__redirect");
if (redirect?.startsWith("/tools/")) {
	window.history.replaceState(null, "", redirect);
}

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element was not found.");
}

function render(root: HTMLElement) {
	createRoot(root).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<BrowserRouter basename={import.meta.env.BASE_URL}>
					<App />
				</BrowserRouter>
			</QueryClientProvider>
		</StrictMode>,
	);
}

// Load the current tool before the first render so prerendered HTML is not
// replaced by the loading fallback.
const routerPath = window.location.pathname.slice(
	import.meta.env.BASE_URL.length - 1,
);
const initialTool = findToolByPath(routerPath);
if (initialTool) {
	initialTool.page.preload().then(
		() => render(rootElement),
		() => render(rootElement),
	);
} else {
	render(rootElement);
}
