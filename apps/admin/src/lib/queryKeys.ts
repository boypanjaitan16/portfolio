export const articleKeys = {
	all: ["admin", "articles"] as const,
	list: () => [...articleKeys.all, "list"] as const,
	detail: (id: string) => [...articleKeys.all, "detail", id] as const,
};
