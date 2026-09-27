import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

it("renders the tools starter and links back to the portfolio", () => {
	render(
		<MemoryRouter>
			<App />
		</MemoryRouter>,
	);

	expect(
		screen.getByRole("heading", { name: "Useful tools, thoughtfully made." }),
	).toBeInTheDocument();
	expect(
		screen.getByRole("link", { name: "Back to portfolio" }),
	).toHaveAttribute("href", "/");
});
