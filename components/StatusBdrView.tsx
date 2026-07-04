"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import { PageHeader, LivePill } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill, EmptyState, SegmentedTabs } from "@/components/ui/Meta";
import { IconUsers, IconCheckCircle, IconClipboard, IconSearch, IconFile, IconX, IconActivity } from "@/components/icons";

// Jadual Supabase sedia ada dari portal asal (status-bdr/index.html):
// bdr(id, bil, nama, jawatan, jarak, emel, telefon, alamat, tugas, peralatan, gambar, menolak_bdr, updated_at)
// Peraturan perniagaan asal: layak BDR jika jarak > 8 km.
export type BdrRow = {
	id: string | number;
	bil: number | null;
	nama: string | null;
	jawatan: string | null;
	jarak: number | null;
	emel: string | null;
	telefon: string | null;
	alamat: string | null;
	tugas: string | null;
	peralatan: string | null;
	gambar: string | null;
	menolak_bdr: boolean | null;
	updated_at: string | null;
};

const LAYAK_KM = 8;
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const ease = [0.16, 1, 0.3, 1] as const;
const t0 = { duration: 0.35, ease };
const t1 = { duration: 0.35, delay: 0.06, ease };
const t2 = { duration: 0.35, delay: 0.12, ease };
const t3 = { duration: 0.35, delay: 0.18, ease };

const isLayak = (r: BdrRow) => (r.jarak ?? 0) > LAYAK_KM;

function initialsOf(name: string | null): string {
	return (name || "?")
		.split(" ")
		.filter(Boolean)
		.map((s) => s[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function Field({ label, value }: { label: string; value: string | null }) {
	return (
		<div>
			<div className="text-[10.5px] font-bold uppercase tracking-wide text-secondary">{label}</div>
			<div className="mt-0.5 text-[12.5px] font-medium text-primary">{value || "\u2014"}</div>
		</div>
	);
}

function ProfileModal({ row, onClose }: { row: BdrRow; onClose: () => void }) {
	const layak = isLayak(row);
	const updated = row.updated_at
		? new Date(row.updated_at).toLocaleString("ms-MY", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
		: "Tiada rekod";
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose} role="dialog" aria-modal="true">
			<div className="w-full max-w-[560px] overflow-hidden rounded-lg glass-card shadow-card" onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between border-b border-border px-5 py-4">
					<div className="flex items-center gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-[12px] font-bold text-secondary">
							{initialsOf(row.nama)}
						</span>
						<div>
							<div className="flex items-center gap-2">
								<b className="text-[13.5px] font-extrabold">{row.nama ?? "\u2014"}</b>
								{row.menolak_bdr && <StatusPill tone="risk">Menolak BDR</StatusPill>}
							</div>
							<span className="text-[11.5px] text-secondary">{row.jawatan ?? "\u2014"}</span>
						</div>
					</div>
					<button onClick={onClose} aria-label="Tutup" className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface">
						<IconX className="h-4 w-4" />
					</button>
				</div>
				<div className="px-5 py-4">
					<div className={`rounded-lg px-4 py-3 ${layak ? "bg-good-soft" : "bg-risk-soft"}`}>
						<b className={`block text-[12.5px] font-extrabold ${layak ? "text-good" : "text-risk"}`}>
							{layak ? "LAYAK BDR" : "TIDAK LAYAK BDR"}
						</b>
						<span className="text-[11.5px] text-secondary">
							Jarak direkodkan: <b className="font-bold text-primary">{row.jarak ?? 0} km</b> (syarat: melebihi {LAYAK_KM} km) · Kemaskini: {updated}
						</span>
					</div>
					<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Field label="E-mel Rasmi" value={row.emel} />
						<Field label="No. Telefon" value={row.telefon} />
						<Field label="Peralatan Jabatan" value={row.peralatan} />
						<Field label="Alamat Kediaman" value={row.alamat} />
					</div>
					{row.tugas && (
						<div className="mt-4">
							<div className="text-[10.5px] font-bold uppercase tracking-wide text-secondary">Deskripsi Tugas BDR</div>
							<p className="mt-1.5 rounded-lg bg-surface px-4 py-3 text-[12.5px] leading-relaxed text-primary">{row.tugas}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export function StatusBdrView({ auth }: { auth: ReturnType<typeof useAuth> }) {
	const [rows, setRows] = useState<BdrRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("SEMUA");
	const [q, setQ] = useState("");
	const [selected, setSelected] = useState<BdrRow | null>(null);
	const [syncedAt, setSyncedAt] = useState<Date | null>(null);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const r = await auth.sb.from("bdr").select("*").order("bil", { ascending: true });
				if (!r.error && r.data) setRows(r.data as BdrRow[]);
			} catch {
				/* RLS / offline: papar empty state */
			}
			setSyncedAt(new Date());
			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const stats = useMemo(() => {
		const total = rows.length;
		const layak = rows.filter(isLayak).length;
		const menolak = rows.filter((r) => r.menolak_bdr).length;
		const totalKm = rows.reduce((s, r) => s + (Number(r.jarak) || 0), 0);
		const purata = total ? (totalKm / total).toFixed(1) : "0";
		return { total, layak, tidak: total - layak, menolak, purata };
	}, [rows]);

	const tabs = useMemo(
		() => [
			{ key: "SEMUA", label: "Semua", count: stats.total },
			{ key: "LAYAK", label: "Layak", count: stats.layak },
			{ key: "TIDAK", label: "Tidak Layak", count: stats.tidak },
			{ key: "MENOLAK", label: "Menolak", count: stats.menolak },
		],
		[stats],
	);

	const filtered = useMemo(() => {
		const needle = q.trim().toLowerCase();
		return rows.filter((r) => {
			const inTab =
				tab === "SEMUA" ||
				(tab === "LAYAK" && isLayak(r)) ||
				(tab === "TIDAK" && !isLayak(r)) ||
				(tab === "MENOLAK" && !!r.menolak_bdr);
			const inQ = !needle || (r.nama || "").toLowerCase().includes(needle) || (r.jawatan || "").toLowerCase().includes(needle);
			return inTab && inQ;
		});
	}, [rows, tab, q]);

	const fmt = (n: number | string) => (loading ? "\u2014" : String(n));

	const columns: Column<BdrRow>[] = [
		{
			key: "bil",
			header: "Bil",
			width: "56px",
			align: "center",
			render: (r) => <span className="tabular-nums text-secondary">{r.bil ?? "\u2014"}</span>,
		},
		{
			key: "nama",
			header: "Nama",
			render: (r) => (
				<span className="flex items-center gap-2.5">
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-secondary">
						{initialsOf(r.nama)}
					</span>
					<b className="font-semibold">{r.nama ?? "\u2014"}</b>
					{r.menolak_bdr && <StatusPill tone="risk">Menolak</StatusPill>}
				</span>
			),
		},
		{
			key: "jawatan",
			header: "Jawatan",
			width: "220px",
			render: (r) => <span className="text-secondary">{r.jawatan ?? "\u2014"}</span>,
		},
		{
			key: "jarak",
			header: "Jarak",
			width: "100px",
			align: "center",
			render: (r) => (
				<span className="rounded-md bg-surface-2 px-2 py-[3px] text-[11px] font-bold tabular-nums text-secondary">{r.jarak ?? 0} km</span>
			),
		},
		{
			key: "status",
			header: "Status",
			width: "120px",
			render: (r) => (isLayak(r) ? <StatusPill tone="good">Layak</StatusPill> : <StatusPill tone="risk">T. Layak</StatusPill>),
		},
	];

	const exportCsv = () => {
		const head = "Bil,Nama,Jawatan,Jarak (km),Layak,Menolak BDR";
		const body = filtered
			.map((r) =>
				[String(r.bil ?? ""), r.nama ?? "", r.jawatan ?? "", String(r.jarak ?? 0), isLayak(r) ? "Ya" : "Tidak", r.menolak_bdr ? "Ya" : "Tidak"]
					.map((v) => `"${v.replaceAll('"', '""')}"`)
					.join(","),
			)
			.join("\n");
		const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `status-bdr-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(a.href);
	};

	return (
		<div className="mx-auto w-full max-w-[1120px] px-7 py-6">
			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t0}>
				<PageHeader
					crumbs={["Operasi", "Status BDR"]}
					title="Status Bekerja Dari Rumah"
					description={syncedAt ? `Data langsung dari Supabase \u00b7 disegerak ${syncedAt.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })}` : "Memuatkan data langsung\u2026"}
					meta={<LivePill />}
					actions={
						<button
							onClick={exportCsv}
							className="flex items-center gap-2 rounded-lg glass-card px-3 py-2 text-[12px] font-semibold text-primary shadow-sm transition-colors hover:bg-surface"
						>
							<IconFile className="h-3.5 w-3.5" />
							Eksport CSV
						</button>
					}
				/>
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t1} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Jumlah Staf" value={fmt(stats.total)} sub="Rekod dalam senarai BDR" tone="accent" Icon={IconUsers} />
				<StatCard label="Layak BDR" value={fmt(stats.layak)} sub={`Jarak melebihi ${LAYAK_KM} km`} tone="good" Icon={IconCheckCircle} />
				<StatCard label="Tidak Layak" value={fmt(stats.tidak)} sub={`${LAYAK_KM} km atau kurang`} tone="warn" Icon={IconClipboard} />
				<StatCard label="Purata Jarak" value={loading ? "\u2014" : `${stats.purata} km`} sub={`${stats.menolak} staf menolak BDR`} tone="accent" Icon={IconActivity} />
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t2} className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
				<SegmentedTabs tabs={tabs} active={tab} onChange={setTab} />
				<label className="flex w-[220px] items-center gap-2 rounded-lg glass-card px-3 py-2 text-[12px] text-secondary focus-within:border-accent">
					<IconSearch className="h-3.5 w-3.5 shrink-0" />
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Cari nama / jawatan…"
						className="w-full bg-transparent text-primary outline-none placeholder:text-secondary"
						aria-label="Cari nama atau jawatan"
					/>
				</label>
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t3} className="mt-3">
				<DataTable
					columns={columns}
					rows={filtered}
					loading={loading}
					footerLabel="staf"
					onRowClick={setSelected}
					emptyState={
						<EmptyState
							Icon={IconSearch}
							title="Tiada rekod dijumpai"
							description={q ? `Tiada staf sepadan dengan "${q}". Cuba kata kunci lain.` : "Tiada data dalam penapis ini, atau capaian disekat oleh RLS Supabase."}
						/>
					}
				/>
			</motion.div>

			{selected && <ProfileModal row={selected} onClose={() => setSelected(null)} />}
		</div>
	);
}
