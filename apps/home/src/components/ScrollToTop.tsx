import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		if (pathname) window.scrollTo({ top: 0, behavior: "instant" });
	}, [pathname]);

	return null;
}
