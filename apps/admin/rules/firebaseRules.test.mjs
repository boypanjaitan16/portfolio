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

test("anonymous visitors can submit valid messages but cannot read or change them", async () => {
	const { default: firebase } = await import("firebase/compat/app");
	await import("firebase/compat/firestore");
	const db = environment.unauthenticatedContext().firestore();
	const now = firebase.firestore.FieldValue.serverTimestamp();
	const valid = {
		name: "Ada",
		email: "ada@example.com",
		message: "A project question for you.",
		locale: "en",
		sourcePath: "/work",
		status: "NEW",
		adminNote: "",
		createdAt: now,
		updatedAt: now,
	};
	await assertSucceeds(
		db.collection("contactMessages").doc("valid").set(valid),
	);
	await assertFails(db.collection("contactMessages").doc("valid").get());
	await assertFails(db.collection("contactMessages").get());
	await assertFails(
		db.collection("contactMessages").doc("valid").update({ status: "DONE" }),
	);
	await assertFails(db.collection("contactMessages").doc("valid").delete());
	await assertFails(
		db
			.collection("contactMessages")
			.doc("bad-status")
			.set({ ...valid, status: "DONE" }),
	);
	await assertFails(
		db
			.collection("contactMessages")
			.doc("bad-note")
			.set({ ...valid, adminNote: "injected" }),
	);
	await assertFails(
		db
			.collection("contactMessages")
			.doc("bad-email")
			.set({ ...valid, email: "invalid" }),
	);
	await assertFails(
		db
			.collection("contactMessages")
			.doc("bad-header")
			.set({
				...valid,
				email: "ada@example.com%0Acc:other@example.com",
			}),
	);
	await assertFails(
		db
			.collection("contactMessages")
			.doc("bad-extra")
			.set({ ...valid, privileged: true }),
	);
	await assertFails(
		db
			.collection("contactMessages")
			.doc("bad-size")
			.set({ ...valid, message: "x".repeat(4001) }),
	);
});

test("authenticated accounts can update follow-up fields and delete messages", async () => {
	const { default: firebase } = await import("firebase/compat/app");
	await import("firebase/compat/firestore");
	const db = environment.authenticatedContext("editor").firestore();
	const message = db.collection("contactMessages").doc("valid");
	const snapshot = await assertSucceeds(message.get());
	assert.equal(snapshot.data().email, "ada@example.com");
	await assertSucceeds(
		message.update({
			status: "IN_PROGRESS",
			adminNote: "Reply tomorrow",
			updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
		}),
	);
	await assertFails(message.update({ email: "other@example.com" }));
	await assertFails(
		message.update({
			adminNote: "x".repeat(2001),
			updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
		}),
	);
	await assertSucceeds(message.delete());
});
