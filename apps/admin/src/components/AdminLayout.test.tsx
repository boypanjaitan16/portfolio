import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import { AdminLayout } from "./AdminLayout";

const routes = [
	{ path: "/", labels: ["Dashboard"], links: [] },
	{
		path: "/articles",
		labels: ["Dashboard", "Articles"],
		links: [{ label: "Dashboard", href: "/" }],
	},
	{
		path: "/articles/new",
		labels: ["Dashboard", "Articles", "New article"],
		links: [
			{ label: "Dashboard", href: "/" },
			{ label: "Articles", href: "/articles" },
		],
	},
	{
		path: "/articles/example/edit",
		labels: ["Dashboard", "Articles", "Edit article"],
		links: [
			{ label: "Dashboard", href: "/" },
			{ label: "Articles", href: "/articles" },
		],
	},
	{
		path: "/articles/example/preview",
		labels: ["Dashboard", "Articles", "Article preview"],
		links: [
			{ label: "Dashboard", href: "/" },
			{ label: "Articles", href: "/articles" },
		],
	},
];

it.each(routes)("shows one breadcrumb for $path", ({ path, labels, links }) => {
	const { container } = render(
		<MemoryRouter initialEntries={[path]}>
			<AdminLayout accountName={null}>
				<main>Admin page</main>
			</AdminLayout>
		</MemoryRouter>,
	);
	const breadcrumb = screen.getByRole("navigation", {
		name: "Admin breadcrumb",
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
	expect(screen.queryByText("View site")).not.toBeInTheDocument();
	expect(container.querySelector("header")).toHaveClass(
		"sticky",
		"top-0",
		"z-40",
		"bg-paper",
	);
});

it("uses the account name and constrains long labels in the header", () => {
	render(
		<MemoryRouter>
			<AdminLayout accountName="  Nama Admin yang Sangat Panjang  ">
				<main>Admin page</main>
			</AdminLayout>
		</MemoryRouter>,
	);
	const button = screen.getByRole("button", {
		name: "Nama Admin yang Sangat Panjang",
	});
	expect(button).toBeInTheDocument();
	expect(
		within(button).getByText("Nama Admin yang Sangat Panjang"),
	).toHaveClass("inline-block", "truncate", "max-w-28");
});
