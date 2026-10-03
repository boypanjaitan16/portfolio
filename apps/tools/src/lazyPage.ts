import { type ComponentType, createElement, lazy } from "react";

export type LazyPage = {
	Page: ComponentType;
	preload: () => Promise<ComponentType>;
};

/**
 * Wraps a page module in `React.lazy`, but renders the page directly once its
 * module has loaded. Preloading before the first render (as `main.tsx` does for
 * the current URL) therefore never shows the Suspense fallback over
 * prerendered HTML.
 */
export function lazyPage<Module, Name extends keyof Module>(
	load: () => Promise<Module>,
	name: Name,
): LazyPage {
	let loaded: ComponentType | undefined;
	let pending: Promise<ComponentType> | undefined;
	const preload = () => {
		pending ??= load().then(
			(module) => {
				loaded = module[name] as ComponentType;
				return loaded;
			},
			(error: unknown) => {
				pending = undefined;
				throw error;
			},
		);
		return pending;
	};
	const LazyComponent = lazy(() =>
		preload().then((component) => ({ default: component })),
	);
	function Page() {
		return createElement(loaded ?? LazyComponent);
	}
	return { Page, preload };
}
