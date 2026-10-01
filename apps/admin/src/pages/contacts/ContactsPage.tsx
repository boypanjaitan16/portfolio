import {
	type ContactMessage,
	type ContactStatus,
	contactLimits,
} from "@portfolio/contact";
import {
	Alert,
	Button,
	Drawer,
	Form,
	Input,
	Popconfirm,
	Segmented,
	Select,
	Table,
	Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import {
	useContactMessages,
	useDeleteContactMessage,
	useUpdateContactMessage,
} from "../../hooks/useContactMessages";

type Filter = "ALL" | ContactStatus;
const labels: Record<ContactStatus, string> = {
	NEW: "Baru",
	IN_PROGRESS: "Diproses",
	DONE: "Selesai",
};

function formatDate(value: string) {
	if (!value) return "—";
	return new Intl.DateTimeFormat("id-ID", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "Asia/Makassar",
	}).format(new Date(value));
}

export function ContactsPage() {
	const { data = [], isLoading, error } = useContactMessages();
	const update = useUpdateContactMessage();
	const remove = useDeleteContactMessage();
	const [filter, setFilter] = useState<Filter>("ALL");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [status, setStatus] = useState<ContactStatus>("NEW");
	const [adminNote, setAdminNote] = useState("");
	const [feedback, setFeedback] = useState<string | null>(null);
	const selected = data.find((item) => item.id === selectedId) ?? null;

	useEffect(() => {
		if (selected) {
			setStatus(selected.status);
			setAdminNote(selected.adminNote);
		}
	}, [selected]);

	const open = (message: ContactMessage) => {
		setFeedback(null);
		setSelectedId(message.id);
	};
	const save = async () => {
		if (!selected) return;
		try {
			await update.mutateAsync({
				id: selected.id,
				status,
				adminNote: adminNote.trim(),
			});
			setFeedback("Perubahan tersimpan.");
		} catch {
			setFeedback("Perubahan gagal disimpan. Coba lagi.");
		}
	};
	const deleteSelected = async () => {
		if (!selected) return;
		try {
			await remove.mutateAsync(selected.id);
			setSelectedId(null);
			setFeedback(null);
		} catch {
			setFeedback("Pesan gagal dihapus. Coba lagi.");
		}
	};
	const columns: ColumnsType<ContactMessage> = [
		{
			title: "Pengirim",
			key: "sender",
			width: 230,
			render: (_, item) => (
				<div>
					<p className="font-semibold">{item.name}</p>
					<p className="text-sm text-muted">{item.email}</p>
				</div>
			),
		},
		{
			title: "Pesan",
			dataIndex: "message",
			key: "message",
			render: (value: string) => <p className="max-w-lg truncate">{value}</p>,
		},
		{
			title: "Status",
			dataIndex: "status",
			width: 130,
			render: (value: ContactStatus) => (
				<Tag
					color={
						value === "NEW"
							? "error"
							: value === "IN_PROGRESS"
								? "processing"
								: "success"
					}
				>
					{labels[value]}
				</Tag>
			),
		},
		{
			title: "Diterima",
			dataIndex: "createdAt",
			width: 175,
			render: formatDate,
		},
		{
			title: "Aksi",
			key: "actions",
			width: 110,
			render: (_, item) => (
				<Button type="link" onClick={() => open(item)}>
					Lihat
				</Button>
			),
		},
	];

	return (
		<main className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-10">
			<p className="section-kicker text-signal">Komunikasi</p>
			<h1 className="mt-5 text-5xl font-semibold tracking-tight">Pesan</h1>
			<p className="mt-3 text-muted">
				Tinjau pesan masuk dan catat tindak lanjut.
			</p>
			<Segmented
				className="mt-8"
				aria-label="Filter status pesan"
				value={filter}
				onChange={(value) => setFilter(value as Filter)}
				options={[
					{ value: "ALL", label: "Semua" },
					...Object.entries(labels).map(([value, label]) => ({ value, label })),
				]}
			/>
			{error && (
				<Alert
					type="error"
					showIcon
					title="Gagal memuat pesan"
					description={error.message}
					className="mt-5"
				/>
			)}
			<Table<ContactMessage>
				className="mt-6"
				rowKey="id"
				columns={columns}
				dataSource={data.filter(
					(item) => filter === "ALL" || item.status === filter,
				)}
				loading={isLoading}
				pagination={{ pageSize: 10, showSizeChanger: false }}
				scroll={{ x: 900 }}
				locale={{ emptyText: "Belum ada pesan." }}
			/>
			<Drawer
				title="Detail pesan"
				open={Boolean(selected)}
				onClose={() => setSelectedId(null)}
				size="min(100vw, 560px)"
				destroyOnHidden
			>
				{selected && (
					<div className="space-y-6">
						<div>
							<p className="font-semibold text-lg">{selected.name}</p>
							<p className="text-muted">{selected.email}</p>
							<p className="mt-2 text-xs text-muted">
								{formatDate(selected.createdAt)} ·{" "}
								{selected.locale.toUpperCase()} · {selected.sourcePath}
							</p>
						</div>
						<div className="whitespace-pre-wrap border-l-2 border-signal pl-4 leading-7">
							{selected.message}
						</div>
						<Button href={`mailto:${selected.email}`} type="primary">
							Balas melalui email
						</Button>
						<Form layout="vertical" onFinish={() => void save()}>
							<Form.Item label="Status">
								<Select
									aria-label="Status"
									value={status}
									onChange={setStatus}
									options={Object.entries(labels).map(([value, label]) => ({
										value,
										label,
									}))}
								/>
							</Form.Item>
							<Form.Item label="Catatan privat">
								<Input.TextArea
									aria-label="Catatan privat"
									value={adminNote}
									onChange={(event) => setAdminNote(event.target.value)}
									maxLength={contactLimits.adminNote}
									showCount
									rows={5}
								/>
							</Form.Item>
							{feedback && (
								<Alert
									type={
										feedback === "Perubahan tersimpan." ? "success" : "error"
									}
									showIcon
									title={feedback}
									className="mb-4"
								/>
							)}
							<div className="flex flex-wrap gap-3">
								<Button
									type="primary"
									htmlType="submit"
									loading={update.isPending}
								>
									Simpan tindak lanjut
								</Button>
								<Popconfirm
									title="Hapus pesan ini?"
									description="Pesan dan catatan akan dihapus permanen."
									okText="Hapus"
									cancelText="Batal"
									okButtonProps={{ danger: true, loading: remove.isPending }}
									onConfirm={() => void deleteSelected()}
								>
									<Button danger disabled={remove.isPending}>
										Hapus pesan
									</Button>
								</Popconfirm>
							</div>
						</Form>
					</div>
				)}
			</Drawer>
		</main>
	);
}

export default ContactsPage;
