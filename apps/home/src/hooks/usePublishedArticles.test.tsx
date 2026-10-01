import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	fetchPublishedArticle,
	fetchPublishedArticles,
	usePublishedArticles,
} from "./usePublishedArticles";

const mocks = vi.hoisted(() => ({
	getDocs: vi.fn(),
	where: vi.fn((field: string, operator: string, value: string) => ({
		field,
		operator,
		value,
	})),
}));

vi.mock("firebase/firestore", () => ({
	collection: vi.fn(() => "articles"),
	getDocs: mocks.getDocs,
	limit: vi.fn((value: number) => ({ limit: value })),
	orderBy: vi.fn((field: string, direction: string) => ({ field, direction })),
	query: vi.fn((...parts: unknown[]) => parts),
	where: mocks.where,
}));
vi.mock("../lib/firebase", () => ({ getFirestoreDb: vi.fn(() => ({})) }));

beforeEach(() => {
	mocks.getDocs.mockReset();
	mocks.where.mockClear();
	mocks.getDocs.mockResolvedValue({ docs: [] });
});

describe("public Firestore queries", () => {
	it("constrains the list to published articles in the selected language", async () => {
		await fetchPublishedArticles("id");
		expect(mocks.where).toHaveBeenCalledWith("status", "==", "PUBLISHED");
		expect(mocks.where).toHaveBeenCalledWith("locale", "==", "id");
	});

	it("constrains a slug lookup to published documents", async () => {
		await fetchPublishedArticle("my-note");
		expect(mocks.where).toHaveBeenCalledWith("slug", "==", "my-note");
		expect(mocks.where).toHaveBeenCalledWith("status", "==", "PUBLISHED");
	});

	it("reuses a fresh TanStack Query result for the same language", async () => {
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		);
		const first = renderHook(() => usePublishedArticles("en"), { wrapper });
		await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
		const second = renderHook(() => usePublishedArticles("en"), { wrapper });
		expect(second.result.current.isSuccess).toBe(true);
		expect(mocks.getDocs).toHaveBeenCalledTimes(1);
		first.unmount();
		second.unmount();
		client.clear();
	});
});
