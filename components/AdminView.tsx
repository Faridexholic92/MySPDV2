"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import type { AuditLogEntry, UserRole } from "@/lib/types";
import { IconPlus, IconMoreVertical, IconShield, IconX, IconSearch } from "@/components/icons";

type DirectoryUser = { id: string; email: string; nama: string | null; role: UserRole };

const MIN_PASSWORD_LENGTH = 8;
const whiteStrokeStyle: React.CSSProperties = { stroke: "#fff" };
const fadeUpHidden = { opacity: 0, y: 14 };
const fadeUpShow = { opacity: 1, y: 0 };
const easeCurve = [0.16, 1, 0.3, 1] as const;
const backdropInitial = { opacity: 0 };
const backdropAnimate = { opacity: 1 };
const drawerInitial = { opacity: 0, x: 40 };
const drawerAnimate = { opacity: 1, x: 0 };
const drawerTransition = { duration: 0.3, ease: easeCurve };
const skeletonPulse = "animate-pulse rounded-lg bg-surface-2";

function useDelay(seconds: number) {
	return { duration: 0.4, delay: seconds, ease: easeCurve };
}

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
	const [loading, setLoading] = useState(true);
	const [drawerOpen, setDrawerOpen] = useState(false);

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
		(async () => {
			setLoading(true);
			await Promise.all([loadUsers(), loadAuditLog()]);
			setLoading(false);
		})();
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
			setTimeout(() => setDrawerOpen(false), 900);
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
	const statCards = [
		{ label: "Jumlah Pengguna", value: users.length },
		{ label: "Superadmin", value: superadminCount },
		{ label: "Staf", value: users.length - superadminCount },
		{ label: "Tindakan Hari Ini", value: auditLog.length },
	];

	return (
		<div className="mx-auto max-w-[1220px] px-7 py-7">
			<motion.div
				initial={fadeUpHidden}
				animate={fadeUpShow}
				transition={useDelay(0)}
				className="mb-5 flex items-end justify-between"
			>
				<div>
					<h1 className="mb-0.5 text-[21px] font-extrabold tracking-tight">Pengurusan Pengguna</h1>
					<p className="text-[13.5px] text-secondary">Urus akaun staf, peranan, dan log aktiviti.</p>
				</div>
				<button
					onClick={() => setDrawerOpen(true)}
					className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black"
				>
					<IconPlus className="h-3.5 w-3.5" style={whiteStrokeStyle} />
					Tambah Pengguna
				</button>
			</motion.div>

			<div className="mb-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
				{statCards.map((s, i) => (
					<motion.div
						key={s.label}
						initial={fadeUpHidden}
						animate={fadeUpShow}
						transition={useDelay(0.06 + i * 0.05)}
						className="rounded-lg glass-card p-4 shadow-sm"
					>
						<span className="mb-1.5 block text-[11px] font-semibold text-secondary">{s.label}</span>
						<b className="text-[22px] font-extrabold">{loading ? "\u2013" : s.value}</b>
					</motion.div>
				))}
			</div>

			<motion.div
				initial={fadeUpHidden}
				animate={fadeUpShow}
				transition={useDelay(0.28)}
				className="mb-5 overflow-hidden rounded-lg glass-card shadow-sm"
			>
				<div className="flex items-center justify-between border-b border-border px-4.5 py-3.5">
					<h2 className="text-[13.5px] font-extrabold">Senarai Pengguna</h2>
					<div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11.5px] text-secondary">
						<IconSearch className="h-3 w-3" />
						Cari pengguna&hellip;
					</div>
				</div>
				{loading ? (
					<div className="space-y-2 p-4.5">
						{[0, 1, 2].map((i) => (
							<div key={i} className={`h-12 ${skeletonPulse}`} />
						))}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="bg-surface">
									<th className="px-4.5 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-secondary">
										Pengguna
									</th>
									<th className="px-4.5 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-secondary">
										Peranan
									</th>
									<th className="px-4.5 py-2.5" />
								</tr>
							</thead>
							<tbody>
								{users.map((u) => (
									<tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface">
										<td className="px-4.5 py-3">
											<div className="flex items-center gap-2.5">
												<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10.5px] font-bold text-secondary">
													{(u.nama || u.email || "U").slice(0, 2).toUpperCase()}
												</div>
												<div className="min-w-0">
													<div className="truncate text-[13.5px] font-bold">{u.nama || u.email}</div>
													<div className="truncate text-[11px] text-secondary">{u.email}</div>
												</div>
											</div>
										</td>
										<td className="px-4.5 py-3">
											<span
												className={`inline-flex rounded-md px-2 py-1 text-[10.5px] font-bold ${
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
												className="flex h-7 w-7 items-center justify-center rounded-md text-secondary hover:bg-surface-2"
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
				)}
				<div className="flex items-center justify-between px-4.5 py-2.5 text-[11px] text-secondary">
					<span>Memaparkan {users.length} pengguna</span>
				</div>
			</motion.div>

			<motion.div
				initial={fadeUpHidden}
				animate={fadeUpShow}
				transition={useDelay(0.36)}
				className="overflow-hidden rounded-lg glass-card shadow-sm"
			>
				<div className="border-b border-border px-4.5 py-3.5">
					<h2 className="text-[13.5px] font-extrabold">Log Audit</h2>
				</div>
				{loading ? (
					<div className="space-y-2 p-4.5">
						{[0, 1].map((i) => (
							<div key={i} className={`h-10 ${skeletonPulse}`} />
						))}
					</div>
				) : (
					<div className="px-4.5">
						{auditLog.map((a, i) => (
							<div
								key={i}
								className={`flex gap-3 py-3 text-[13px] ${i < auditLog.length - 1 ? "border-b border-border" : ""}`}
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
				)}
			</motion.div>

			<AnimatePresence>
				{drawerOpen && (
					<>
						<motion.div
							initial={backdropInitial}
							animate={backdropAnimate}
							exit={backdropInitial}
							className="fixed inset-0 z-40 bg-black/30"
							onClick={() => setDrawerOpen(false)}
						/>
						<motion.div
							initial={drawerInitial}
							animate={drawerAnimate}
							exit={drawerInitial}
							transition={drawerTransition}
							className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[380px] flex-col glass-strong border-l-0 p-6 shadow-card"
						>
							<button
								onClick={() => setDrawerOpen(false)}
								className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-lg border border-border text-secondary"
							>
								<IconX className="h-3.5 w-3.5" />
							</button>
							<h2 className="mb-1 text-base font-extrabold">Tambah Pengguna Baharu</h2>
							<p className="mb-6 text-xs text-secondary">Cipta akaun staf dengan peranan yang sesuai.</p>
							<div className="space-y-3.5">
								<div>
									<label className="mb-1.5 block text-[11.5px] font-bold">Email</label>
									<input
										placeholder="nama@jupem.gov.my"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full rounded-[9px] border border-border bg-surface px-3 py-2.5 text-[13.5px] outline-none focus:border-accent focus:ring-[3.5px] focus:ring-accent-soft"
									/>
								</div>
								<div>
									<label className="mb-1.5 block text-[11.5px] font-bold">Kata Laluan Sementara</label>
									<input
										type="password"
										placeholder={`Min. ${MIN_PASSWORD_LENGTH} aksara`}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="w-full rounded-[9px] border border-border bg-surface px-3 py-2.5 text-[13.5px] outline-none focus:border-accent focus:ring-[3.5px] focus:ring-accent-soft"
									/>
								</div>
								<div>
									<label className="mb-1.5 block text-[11.5px] font-bold">Peranan</label>
									<select
										value={role}
										onChange={(e) => setRole(e.target.value as UserRole)}
										className="w-full rounded-[9px] border border-border bg-surface px-3 py-2.5 text-[13.5px] outline-none focus:border-accent focus:ring-[3.5px] focus:ring-accent-soft"
									>
										<option value="staf">Staf</option>
										<option value="superadmin">Superadmin</option>
									</select>
								</div>
								{msg && (
									<div
										className={`rounded-[9px] border px-3 py-2 text-xs ${
											msg.ok ? "border-good/30 bg-good-soft text-good" : "border-risk/30 bg-risk-soft text-risk"
										}`}
									>
										{msg.text}
									</div>
								)}
							</div>
							<button
								onClick={addNewUser}
								disabled={busy}
								className="mt-auto min-h-[44px] w-full rounded-[9px] bg-ink text-[13.5px] font-bold text-white transition hover:bg-black disabled:opacity-60"
							>
								{busy ? "Mendaftar..." : "Daftar Pengguna"}
							</button>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
