import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import {
	assertFails,
	assertSucceeds,
	initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

const projectId = "demo-portfolio";
let environment;
before(async () => {
	environment = await initializeTestEnvironment({
		projectId,
		firestore: {
			rules: readFileSync(
				new URL("../../../firestore.rules", import.meta.url),
				"utf8",
			),
		},
		storage: {
			rules: readFileSync(
				new URL("../../../storage.rules", import.meta.url),
				"utf8",
			),
		},
	});
	await environment.withSecurityRulesDisabled(async (context) => {
		const db = context.firestore();
		await db.collection("articles").doc("published").set({
			id: "published",
			slug: "published",
			status: "PUBLISHED",
			locale: "en",
			createdAt: "2026-01-01T00:00:00.000Z",
		});
		await db.collection("articles").doc("draft").set({
			id: "draft",
			slug: "draft",
			status: "DRAFT",
			locale: "en",
			createdAt: "2026-01-01T00:00:00.000Z",
		});
	});
});
after(async () => {
	await environment?.cleanup();
});

test("anonymous users read published articles but not drafts", async () => {
	const db = environment.unauthenticatedContext().firestore();
	const published = await assertSucceeds(
		db.collection("articles").doc("published").get(),
	);
	assert.equal(published.data().status, "PUBLISHED");
	await assertFails(db.collection("articles").doc("draft").get());
	await assertSucceeds(
		db.collection("articles").where("status", "==", "PUBLISHED").get(),
	);
	await assertFails(db.collection("articles").get());
});

test("authenticated accounts can create and edit drafts", async () => {
	const db = environment.authenticatedContext("editor").firestore();
	await assertSucceeds(
		db.collection("articles").doc("new-draft").set({
			id: "new-draft",
			slug: "new-draft",
			status: "DRAFT",
			locale: "id",
			createdAt: "2026-01-01T00:00:00.000Z",
		}),
	);
	await assertSucceeds(db.collection("articles").doc("new-draft").get());
	const missing = await assertSucceeds(
		db.collection("articles").doc("unused-slug").get(),
	);
	assert.equal(missing.exists, false);
	await assertFails(
		db.collection("articles").doc("wrong-id").set({
			id: "mismatch",
			slug: "mismatch",
			status: "DRAFT",
			createdAt: "2026-01-01T00:00:00.000Z",
		}),
	);
});

test("only authenticated accounts upload media, and public readers can get it", async () => {
	const path = "articles/published/body/rules-test.png";
	const authed = environment
		.authenticatedContext("editor")
		.storage(`gs://${projectId}.appspot.com`);
	const anonymous = environment
		.unauthenticatedContext()
		.storage(`gs://${projectId}.appspot.com`);
	await assertFails(
		anonymous.ref(path).putString("test", "raw", { contentType: "image/png" }),
	);
	await assertSucceeds(
		authed.ref(path).putString("test", "raw", { contentType: "image/png" }),
	);
	await assertSucceeds(anonymous.ref(path).getMetadata());
});
