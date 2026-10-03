import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { lazyPage } from "./lazyPage";

function Example() {
	return <h1>Loaded page</h1>;
}

it("shows the fallback until a page loads, then renders it directly", async () => {
	const load = vi.fn(async () => ({ Example }));
	const { Page, preload } = lazyPage(load, "Example");
	const { unmount } = render(
		<Suspense fallback={<p>Loading page</p>}>
			<Page />
		</Suspense>,
	);
	expect(screen.getByText("Loading page")).toBeInTheDocument();
	expect(
		await screen.findByRole("heading", { name: "Loaded page" }),
	).toBeInTheDocument();
	unmount();

	await preload();
	render(
		<Suspense fallback={<p>Loading page</p>}>
			<Page />
		</Suspense>,
	);
	expect(screen.queryByText("Loading page")).not.toBeInTheDocument();
	expect(
		screen.getByRole("heading", { name: "Loaded page" }),
	).toBeInTheDocument();
	expect(load).toHaveBeenCalledTimes(1);
});

it("retries a page module that failed to load", async () => {
	const load = vi
		.fn<() => Promise<{ Example: typeof Example }>>()
		.mockRejectedValueOnce(new Error("offline"))
		.mockResolvedValueOnce({ Example });
	const { preload } = lazyPage(load, "Example");
	await expect(preload()).rejects.toThrow("offline");
	await expect(preload()).resolves.toBe(Example);
	expect(load).toHaveBeenCalledTimes(2);
});
