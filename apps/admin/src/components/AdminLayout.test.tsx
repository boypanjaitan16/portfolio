import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import { AdminLayout } from "./AdminLayout";

const routes = [
	{ path: "/", labels: ["Dashboard"], links: [] },
	{
		path: "/articles",
		labels: ["Dashboard", "Artikel"],
		links: [{ label: "Dashboard", href: "/" }],
	},
	{
		path: "/articles/new",
		labels: ["Dashboard", "Artikel", "Artikel baru"],
		links: [
			{ label: "Dashboard", href: "/" },
			{ label: "Artikel", href: "/articles" },
		],
	},
	{
		path: "/articles/example/edit",
		labels: ["Dashboard", "Artikel", "Edit artikel"],
		links: [
			{ label: "Dashboard", href: "/" },
			{ label: "Artikel", href: "/articles" },
		],
	},
	{
		path: "/articles/example/preview",
		labels: ["Dashboard", "Artikel", "Preview artikel"],
		links: [
			{ label: "Dashboard", href: "/" },
			{ label: "Artikel", href: "/articles" },
		],
	},
];

it.each(routes)("shows one breadcrumb for $path", ({ path, labels, links }) => {
	const { container } = render(
		<MemoryRouter initialEntries={[path]}>
			<AdminLayout>
				<main>Halaman admin</main>
			</AdminLayout>
		</MemoryRouter>,
	);
	const breadcrumb = screen.getByRole("navigation", {
		name: "Breadcrumb admin",
	});
	expect(breadcrumb.querySelectorAll(".ant-breadcrumb-link")).toHaveLength(
		labels.length,
	);
	for (const label of labels) {
		expect(within(breadcrumb).getByText(label)).toBeInTheDocument();
	}
	for (const { label, href } of links) {
		expect(
			within(breadcrumb).getByRole("link", { name: label }),
		).toHaveAttribute("href", href);
	}
	expect(
		within(breadcrumb).queryByRole("link", { name: labels.at(-1) }),
	).not.toBeInTheDocument();
	expect(screen.queryByText("Lihat situs")).not.toBeInTheDocument();
	expect(container.querySelector("header")).toHaveClass(
		"sticky",
		"top-0",
		"z-40",
		"bg-paper",
	);
});
