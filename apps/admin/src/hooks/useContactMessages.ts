import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	deleteContactMessage,
	listContactMessages,
	updateContactMessage,
} from "../lib/contactMessages";

export const contactKeys = {
	list: () => ["admin", "contactMessages", "list"] as const,
};

export function useContactMessages() {
	return useQuery({
		queryKey: contactKeys.list(),
		queryFn: listContactMessages,
	});
}

export function useUpdateContactMessage() {
	const client = useQueryClient();
	return useMutation({
		mutationFn: updateContactMessage,
		onSuccess: () => client.invalidateQueries({ queryKey: contactKeys.list() }),
	});
}

export function useDeleteContactMessage() {
	const client = useQueryClient();
	return useMutation({
		mutationFn: deleteContactMessage,
		onSuccess: () => client.invalidateQueries({ queryKey: contactKeys.list() }),
	});
}
