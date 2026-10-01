import type { Article } from "@portfolio/articles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getArticle,
	listArticles,
	removeArticle,
	type SaveArticleInput,
	saveArticle,
} from "../lib/articles";
import { articleKeys } from "../lib/queryKeys";

export function useArticles() {
	return useQuery({ queryKey: articleKeys.list(), queryFn: listArticles });
}

export function useArticle(id: string | undefined) {
	return useQuery({
		queryKey: articleKeys.detail(id ?? ""),
		queryFn: () => getArticle(id ?? ""),
		enabled: Boolean(id),
	});
}

export function useSaveArticle() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: saveArticle,
		onSuccess: ({ article }) => {
			queryClient.invalidateQueries({ queryKey: articleKeys.list() });
			queryClient.setQueryData(articleKeys.detail(article.id), article);
		},
	});
}

export function useDeleteArticle() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (article: Article) => removeArticle(article),
		onSuccess: (_result, article) => {
			queryClient.invalidateQueries({ queryKey: articleKeys.list() });
			queryClient.removeQueries({ queryKey: articleKeys.detail(article.id) });
		},
	});
}

export type { SaveArticleInput };
