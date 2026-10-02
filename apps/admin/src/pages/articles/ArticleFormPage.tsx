import { zodResolver } from "@hookform/resolvers/zod";
import { slugify } from "@portfolio/articles";
import { Alert, Button, Form, Input, Select, Spin, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { ArticleEditor } from "../../components/ArticleEditor";
import { useArticle, useSaveArticle } from "../../hooks/useArticles";
import { type PendingImage, validateImage } from "../../lib/articleMedia";
import {
	type ArticleFormValues,
	articleSchema,
} from "../../schemas/articleSchema";

const defaultValues: ArticleFormValues = {
	locale: "en",
	title: "",
	slug: "",
	summary: "",
	topic: "",
	contentHtml: "",
	status: "DRAFT",
};

export function ArticleFormPage() {
	const { articleId } = useParams();
	const isEditing = Boolean(articleId);
	const { data: article, isLoading, error: loadError } = useArticle(articleId);
	const save = useSaveArticle();
	const navigate = useNavigate();
	const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
	const pendingRef = useRef<PendingImage[]>([]);
	const [coverFile, setCoverFile] = useState<File | null>(null);
	const [removeCover, setRemoveCover] = useState(false);
	const [message, setMessage] = useState("");
	const [loadedArticleId, setLoadedArticleId] = useState<string | null>(null);
	const slugEdited = useRef(false);
	const {
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<ArticleFormValues>({
		resolver: zodResolver(articleSchema),
		defaultValues,
	});

	useEffect(() => {
		if (!article) return;
		reset({
			locale: article.locale,
			title: article.title,
			slug: article.slug,
			summary: article.summary,
			topic: article.topic,
			contentHtml: article.contentHtml,
			status: article.status,
		});
		slugEdited.current = true;
		setLoadedArticleId(article.id);
	}, [article, reset]);

	useEffect(
		() => () => {
			for (const image of pendingRef.current) URL.revokeObjectURL(image.url);
		},
		[],
	);

	const submit = async (values: ArticleFormValues) => {
		setMessage("");
		if (isEditing && !article) {
			setMessage("Article not found.");
			return;
		}
		try {
			const result = await save.mutateAsync({
				values,
				previous: article ?? null,
				pendingImages,
				coverFile,
				removeCover,
			});
			if (result.cleanupFailed) {
				setMessage("Article saved, but some old media could not be removed.");
				return;
			}
			navigate("/articles", { state: { saved: true } });
		} catch (reason) {
			setMessage(
				reason instanceof Error
					? reason.message
					: "Could not save the article.",
			);
		}
	};

	if (isEditing && (isLoading || (article && loadedArticleId !== article.id)))
		return <Spin size="large" description="Loading article…" fullscreen />;
	if (isEditing && !article)
		return (
			<Alert
				type="error"
				showIcon
				title={loadError?.message ?? "Article not found."}
				className="m-10"
			/>
		);

	const coverFileList: UploadFile[] = coverFile
		? [{ uid: "new-cover", name: coverFile.name, status: "done" }]
		: article?.cover && !removeCover
			? [
					{
						uid: "current-cover",
						name: "Current cover",
						status: "done",
						url: article.cover.url,
					},
				]
			: [];

	return (
		<main className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-10">
			<h1 className="text-5xl font-semibold tracking-tight">
				{isEditing ? "Edit article" : "New article"}
			</h1>
			<p className="mt-3 text-muted">
				Published articles appear on the site immediately. Deploy Pages to
				update static HTML and the sitemap.
			</p>
			{message && (
				<Alert type="error" showIcon title={message} className="mt-6" />
			)}
			<Form
				layout="vertical"
				size="large"
				onSubmitCapture={handleSubmit(submit)}
				className="mt-8"
			>
				<div className="grid gap-x-6 md:grid-cols-2">
					<Form.Item
						label="Language"
						validateStatus={errors.locale ? "error" : undefined}
						help={errors.locale?.message}
					>
						<Controller
							name="locale"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									aria-label="Language"
									options={[
										{ value: "en", label: "English" },
										{ value: "id", label: "Indonesian" },
									]}
								/>
							)}
						/>
					</Form.Item>
					<Form.Item
						label="Status"
						validateStatus={errors.status ? "error" : undefined}
						help={errors.status?.message}
					>
						<Controller
							name="status"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									aria-label="Status"
									options={[
										{ value: "DRAFT", label: "Draft" },
										{ value: "PUBLISHED", label: "Published" },
									]}
								/>
							)}
						/>
					</Form.Item>
				</div>
				<Form.Item
					label="Title"
					validateStatus={errors.title ? "error" : undefined}
					help={errors.title?.message}
				>
					<Controller
						name="title"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								id="title"
								status={errors.title ? "error" : undefined}
								onChange={(event) => {
									field.onChange(event);
									if (!slugEdited.current)
										setValue("slug", slugify(event.target.value), {
											shouldValidate: true,
										});
								}}
							/>
						)}
					/>
				</Form.Item>
				<Form.Item
					label="Slug"
					validateStatus={errors.slug ? "error" : undefined}
					help={errors.slug?.message}
				>
					<Controller
						name="slug"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								id="slug"
								disabled={isEditing}
								status={errors.slug ? "error" : undefined}
								onChange={(event) => {
									slugEdited.current = true;
									field.onChange(event);
								}}
							/>
						)}
					/>
				</Form.Item>
				<div className="grid gap-x-6 md:grid-cols-2">
					<Form.Item
						label="Summary"
						validateStatus={errors.summary ? "error" : undefined}
						help={errors.summary?.message}
					>
						<Controller
							name="summary"
							control={control}
							render={({ field }) => (
								<Input.TextArea
									{...field}
									id="summary"
									rows={3}
									status={errors.summary ? "error" : undefined}
								/>
							)}
						/>
					</Form.Item>
					<Form.Item
						label="Topic"
						validateStatus={errors.topic ? "error" : undefined}
						help={errors.topic?.message}
					>
						<Controller
							name="topic"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									id="topic"
									status={errors.topic ? "error" : undefined}
								/>
							)}
						/>
					</Form.Item>
				</div>
				<Form.Item label="Cover image (optional, up to 5 MB)">
					<Upload.Dragger
						accept="image/jpeg,image/png,image/webp,image/gif"
						maxCount={1}
						listType="picture"
						fileList={coverFileList}
						beforeUpload={(file) => {
							try {
								validateImage(file);
								setCoverFile(file);
								setRemoveCover(false);
								setMessage("");
								return false;
							} catch (reason) {
								setMessage(
									reason instanceof Error ? reason.message : "Invalid image.",
								);
								return Upload.LIST_IGNORE;
							}
						}}
						onRemove={() => {
							if (coverFile) setCoverFile(null);
							else if (article?.cover) setRemoveCover(true);
							return true;
						}}
					>
						<p className="text-sm font-medium text-ink">
							Drag an image here or click to choose a cover
						</p>
						<p className="mt-2 text-xs text-muted">
							JPEG, PNG, WebP, or GIF · Up to 5 MB
						</p>
					</Upload.Dragger>
				</Form.Item>
				<Form.Item
					label="Article content"
					validateStatus={errors.contentHtml ? "error" : undefined}
					help={errors.contentHtml?.message}
				>
					<Controller
						name="contentHtml"
						control={control}
						render={({ field }) => (
							<ArticleEditor
								content={field.value}
								onChange={field.onChange}
								onAddImage={(image) => {
									pendingRef.current.push(image);
									setPendingImages((current) => [...current, image]);
								}}
								onError={setMessage}
							/>
						)}
					/>
				</Form.Item>
				<div className="flex flex-wrap gap-3 border-t border-ink/20 pt-6">
					<Button
						type="primary"
						htmlType="submit"
						loading={isSubmitting || save.isPending}
					>
						Save article
					</Button>
					{article && (
						<Button onClick={() => navigate(`/articles/${article.id}/preview`)}>
							Preview
						</Button>
					)}
				</div>
			</Form>
		</main>
	);
}

export default ArticleFormPage;
