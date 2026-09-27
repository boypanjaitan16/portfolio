import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

it("renders the portfolio starter and links to tools", () => {
	render(
		<MemoryRouter>
			<App />
		</MemoryRouter>,
	);

	expect(
		screen.getByRole("heading", { name: "Boy Boni Panjaitan" }),
	).toBeInTheDocument();
	expect(screen.getByRole("link", { name: "Explore tools" })).toHaveAttribute(
		"href",
		"/tools/",
	);
});
