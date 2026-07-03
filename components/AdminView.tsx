"use client";

import { useEffect, useState } from "react";
import type { useAuth } from "@/hooks/useAuth";
import type { AuditLogEntry, UserRole } from "@/lib/types";
import { IconPlus, IconMoreVertical, IconShield } from "@/components/icons";

type DirectoryUser = { id: string; email: string; nama: string | null; role: UserRole };

const MIN_PASSWORD_LENGTH = 8;
const whiteStrokeStyle: React.CSSProperties = { stroke: "#fff" };

// NOTE (keselamatan): Panel ini kekal panggil Supabase terus dari browser,
// sama macam portal asal (pilihan sengaja - bukan silap). Semakan
// `user.role === "superadmin"` yang mengawal PAPARAN panel ini HANYA berlaku
// di client. Ia BUKAN sekatan keselamatan sebenar. Perlindungan sebenar mesti
// datang daripada:
//   1. Row Level Security (RLS) di jadual `profiles`, `admin_audit`, dsb.
//   2. Semakan role di dalam fungsi pelayan (edge function) `create-user`
//      - pastikan ia sendiri sahkan JWT pemanggil == superadmin sebelum
//        cipta akaun baru, jangan percaya nilai `role` yang dihantar client.
export function AdminView({
	auth,
	showToast,
}: {
	auth: ReturnType<typeof useAuth>;
	showToast: (msg: string, type?: "info" | "ok" | "err") => void;
}) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<UserRole>("staf");
	const [busy, setBusy] = useState(false);
	const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
	const [users, setUsers] = useState<DirectoryUser[]>([]);
	const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

	async function loadUsers() {
		const { data, error } = await auth.sb.from("profiles").select("id, email, nama, role");
		if (!error) setUsers((data as DirectoryUser[]) || []);
	}

	async function loadAuditLog() {
		const { data, error } = await auth.sb
			.from("admin_audit")
			.select("actor_email, action, target_email, detail, created_at")
			.order("created_at", { ascending: false })
			.limit(50);
		if (!error) setAuditLog((data as AuditLogEntry[]) || []);
	}

	useEffect(() => {
		void loadUsers();
		void loadAuditLog();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function addNewUser() {
		if (!email.trim()) {
			setMsg({ text: "Sila masukkan email.", ok: false });
			return;
		}
		if (!password || password.length < MIN_PASSWORD_LENGTH) {
			setMsg({ text: `Kata laluan mestilah ${MIN_PASSWORD_LENGTH} aksara ke atas.`, ok: false });
			return;
		}
		setBusy(true);
		try {
			const {
				data: { session },
			} = await auth.sb.auth.getSession();
			const token = session?.access_token;
			if (!token) throw new Error("Sesi tamat. Sila log masuk semula.");

			const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
					apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
				},
				body: JSON.stringify({ email: email.trim(), password, role }),
			});
			const out = await res.json().catch(() => ({}));
			if (!res.ok || out.error) throw new Error(out.error || "Gagal daftar pengguna.");

			setMsg({ text: `\u2705 ${email} (${out.role || role}) berjaya didaftarkan!`, ok: true });
			showToast("Pengguna ditambah.", "ok");
			setEmail("");
			setPassword("");
			void loadUsers();
			void loadAuditLog();
		} catch (e) {
			setMsg({ text: (e as Error)?.message || "Gagal daftar pengguna.", ok: false });
		} finally {
			setBusy(false);
		}
	}

	async function toggleRole(u: DirectoryUser) {
		const newRole: UserRole = u.role === "superadmin" ? "staf" : "superadmin";
		try {
			const { error } = await auth.sb.from("profiles").update({ role: newRole }).eq("id", u.id);
			if (error) throw error;
			showToast(`${u.email} kini ${newRole}.`, "ok");
			void loadUsers();
			void loadAuditLog();
		} catch (e) {
			showToast("Gagal tukar peranan: " + ((e as Error)?.message || ""), "err");
		}
	}

	const superadminCount = users.filter((u) => u.role === "superadmin").length;

	return (
		<div className="mx-auto max-w-[1180px] px-7 py-8">
			<h1 className="mb-1 text-[22px] font-extrabold tracking-tight">Pengurusan Pengguna</h1>
			<p className="mb-6 text-[13.5px] text-secondary">
				Tambah akaun staf, urus peranan, dan semak log aktiviti pentadbiran.
			</p>

			<div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
				<div className="rounded-lg border border-border bg-canvas p-4">
					<b className="block text-xl font-extrabold">{users.length}</b>
					<span className="text-xs text-secondary">Jumlah Pengguna</span>
				</div>
				<div className="rounded-lg border border-border bg-canvas p-4">
					<b className="block text-xl font-extrabold">{superadminCount}</b>
					<span className="text-xs text-secondary">Superadmin</span>
				</div>
				<div className="rounded-lg border border-border bg-canvas p-4">
					<b className="block text-xl font-extrabold">{users.length - superadminCount}</b>
					<span className="text-xs text-secondary">Staf</span>
				</div>
				<div className="rounded-lg border border-border bg-canvas p-4">
					<b className="block text-xl font-extrabold">{auditLog.length}</b>
					<span className="text-xs text-secondary">Rekod Log</span>
				</div>
			</div>

			<div className="mb-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
				<div className="overflow-hidden rounded-lg border border-border bg-canvas">
					<div className="flex items-center justify-between border-b border-border px-4.5 py-4">
						<h2 className="text-[14px] font-extrabold">Senarai Pengguna</h2>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr>
									<th className="px-4.5 pb-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-secondary">
										Pengguna
									</th>
									<th className="px-4.5 pb-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-secondary">
										Peranan
									</th>
									<th className="px-4.5 pb-2.5" />
								</tr>
							</thead>
							<tbody>
								{users.map((u) => (
									<tr key={u.id} className="border-t border-border hover:bg-surface">
										<td className="px-4.5 py-3">
											<div className="flex items-center gap-2.5">
												<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10.5px] font-bold text-secondary">
													{(u.nama || u.email || "U").slice(0, 2).toUpperCase()}
												</div>
												<div className="min-w-0">
													<div className="truncate text-[13px] font-bold">{u.nama || u.email}</div>
													<div className="truncate text-[11.5px] text-secondary">{u.email}</div>
												</div>
											</div>
										</td>
										<td className="px-4.5 py-3">
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
													u.role === "superadmin" ? "bg-accent-soft text-accent" : "bg-surface-2 text-secondary"
												}`}
											>
												{u.role === "superadmin" ? "Superadmin" : "Staf"}
											</span>
										</td>
										<td className="px-4.5 py-3 text-right">
											<button
												onClick={() => toggleRole(u)}
												title="Tukar peranan"
												className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-secondary hover:bg-surface-2"
											>
												<IconMoreVertical className="h-3.5 w-3.5" />
											</button>
										</td>
									</tr>
								))}
								{users.length === 0 && (
									<tr>
										<td colSpan={3} className="px-4.5 py-6 text-center text-xs text-secondary">
											Tiada pengguna.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				<div className="overflow-hidden rounded-lg border border-border bg-canvas">
					<div className="border-b border-border px-4.5 py-4">
						<h2 className="text-[14px] font-extrabold">Tambah Pengguna Baharu</h2>
					</div>
					<div className="space-y-3 p-4.5">
						<div>
							<label className="mb-1.5 block text-[11.5px] font-semibold">Email</label>
							<input
								placeholder="nama@jupem.gov.my"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
							/>
						</div>
						<div>
							<label className="mb-1.5 block text-[11.5px] font-semibold">Kata Laluan Sementara</label>
							<input
								type="password"
								placeholder={`Min. ${MIN_PASSWORD_LENGTH} aksara`}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
							/>
						</div>
						<div>
							<label className="mb-1.5 block text-[11.5px] font-semibold">Peranan</label>
							<select
								value={role}
								onChange={(e) => setRole(e.target.value as UserRole)}
								className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
							>
								<option value="staf">Staf</option>
								<option value="superadmin">Superadmin</option>
							</select>
						</div>
						{msg && (
							<div
								className={`rounded-lg border px-3 py-2 text-xs ${
									msg.ok ? "border-good/30 bg-good-soft text-good" : "border-risk/30 bg-risk-soft text-risk"
								}`}
							>
								{msg.text}
							</div>
						)}
						<button
							onClick={addNewUser}
							disabled={busy}
							className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-lg bg-accent text-[13px] font-bold text-white disabled:opacity-60"
						>
							<IconPlus className="h-3.5 w-3.5" style={whiteStrokeStyle} />
							{busy ? "Mendaftar..." : "Daftar Pengguna"}
						</button>
					</div>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border border-border bg-canvas">
				<div className="border-b border-border px-4.5 py-4">
					<h2 className="text-[14px] font-extrabold">Log Audit</h2>
				</div>
				<div className="p-4.5">
					{auditLog.map((a, i) => (
						<div
							key={i}
							className={`flex gap-3 py-2.5 text-[12.5px] ${i < auditLog.length - 1 ? "border-b border-border" : ""}`}
						>
							<div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md bg-surface-2 text-secondary">
								<IconShield className="h-3.5 w-3.5" />
							</div>
							<div>
								<b className="font-bold">{a.actor_email}</b> {a.action} <b className="font-bold">{a.target_email}</b>
								<div className="mt-0.5 text-secondary">{new Date(a.created_at).toLocaleString("ms-MY")}</div>
							</div>
						</div>
					))}
					{auditLog.length === 0 && <div className="py-4 text-xs text-secondary">Tiada rekod log.</div>}
				</div>
			</div>
		</div>
	);
}
