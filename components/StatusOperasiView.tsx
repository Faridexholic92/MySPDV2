"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import { PageHeader, LivePill } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill, EmptyState, SegmentedTabs, type PillTone } from "@/components/ui/Meta";
import { IconSatellite, IconUsers, IconClock, IconSearch, IconFile } from "@/components/icons";

// Jadual Supabase sedia ada dari portal asal (status-operasi/index.html):
// operasi(id, user_id, nama, status, tarikh_mula, tarikh_tamat, masa_keluar, nota, gambar, created_at)
export type OperasiRow = {
	id: string | number;
	user_id: string | null;
	nama: string | null;
	status: string | null;
	tarikh_mula: string | null;
	tarikh_tamat: string | null;
	masa_keluar: string | null;
	nota: string | null;
	gambar: string | null;
	created_at: string | null;
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const ease = [0.16, 1, 0.3, 1] as const;
const t0 = { duration: 0.35, ease };
const t1 = { duration: 0.35, delay: 0.06, ease };
const t2 = { duration: 0.35, delay: 0.12, ease };
const t3 = { duration: 0.35, delay: 0.18, ease };

// Status keberadaan disimpan sebagai teks bebas (cth. PEJABAT, BDR, 4 JAM, CUTI, LUAR).
function toneOf(status: string | null): PillTone {
	const s = (status || "").toUpperCase();
	if (!s) return "neutral";
	if (s.includes("PEJABAT") || s.includes("HADIR")) return "good";
	if (s.includes("CUTI") || s.includes("SAKIT") || s.includes("TIADA")) return "risk";
	if (s.includes("4 JAM") || s.includes("LUAR") || s.includes("KURSUS") || s.includes("MESYUARAT")) return "warn";
	return "accent";
}

function initialsOf(name: string | null): string {
	return (name || "?").split(" ").filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

export function StatusOperasiView({ auth }: { auth: ReturnType<typeof useAuth> }) {
	const [rows, setRows] = useState<OperasiRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("SEMUA");
	const [q, setQ] = useState("");
	const [syncedAt, setSyncedAt] = useState<Date | null>(null);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const r = await auth.sb.from("operasi").select("*").order("nama", { ascending: true });
				if (!r.error && r.data) setRows(r.data as OperasiRow[]);
			} catch {
				/* RLS / offline: papar empty state */
			}
			setSyncedAt(new Date());
			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Tab dijana secara data-driven daripada nilai status sebenar.
	const tabs = useMemo(() => {
		const counts = new Map<string, number>();
		for (const r of rows) {
			const k = (r.status || "TIADA STATUS").toUpperCase();
			counts.set(k, (counts.get(k) ?? 0) + 1);
		}
		const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);
		return [{ key: "SEMUA", label: "Semua", count: rows.length }, ...top.map(([k, n]) => ({ key: k, label: k.charAt(0) + k.slice(1).toLowerCase(), count: n }))];
	}, [rows]);

	const filtered = useMemo(() => {
		const needle = q.trim().toLowerCase();
		return rows.filter((r) => {
			const k = (r.status || "TIADA STATUS").toUpperCase();
			const inTab = tab === "SEMUA" || k === tab;
			const inQ = !needle || (r.nama || "").toLowerCase().includes(needle) || (r.nota || "").toLowerCase().includes(needle);
			return inTab && inQ;
		});
	}, [rows, tab, q]);

	const stats = useMemo(() => {
		const total = rows.length;
		const pejabat = rows.filter((r) => toneOf(r.status) === "good").length;
		const luar = rows.filter((r) => toneOf(r.status) === "warn" || toneOf(r.status) === "accent").length;
		const cuti = rows.filter((r) => toneOf(r.status) === "risk").length;
		return { total, pejabat, luar, cuti };
	}, [rows]);

	const fmt = (n: number) => (loading ? "\u2014" : String(n));
	const fmtDate = (d: string | null) =>
		d ? new Date(d).toLocaleDateString("ms-MY", { day: "2-digit", month: "short" }) : "\u2014";

	const columns: Column<OperasiRow>[] = [
		{
			key: "nama",
			header: "Nama",
			width: "230px",
			render: (r) => (
				<span className="flex items-center gap-2.5">
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-secondary">
						{initialsOf(r.nama)}
					</span>
					<b className="truncate font-semibold">{r.nama ?? "\u2014"}</b>
				</span>
			),
		},
		{
			key: "status",
			header: "Status",
			width: "150px",
			render: (r) => <StatusPill tone={toneOf(r.status)}>{r.status || "Tiada Status"}</StatusPill>,
		},
		{ key: "tarikh_mula", header: "Mula", width: "90px", render: (r) => <span className="tabular-nums text-secondary">{fmtDate(r.tarikh_mula)}</span> },
		{ key: "tarikh_tamat", header: "Tamat", width: "90px", render: (r) => <span className="tabular-nums text-secondary">{fmtDate(r.tarikh_tamat)}</span> },
		{ key: "masa_keluar", header: "Masa Keluar", width: "110px", render: (r) => <span className="tabular-nums text-secondary">{r.masa_keluar || "\u2014"}</span> },
		{ key: "nota", header: "Nota", render: (r) => <span className="block truncate text-secondary">{r.nota || "\u2014"}</span> },
	];

	const exportCsv = () => {
		const head = "Nama,Status,Tarikh Mula,Tarikh Tamat,Masa Keluar,Nota";
		const body = filtered
			.map((r) => [r.nama ?? "", r.status ?? "", r.tarikh_mula ?? "", r.tarikh_tamat ?? "", r.masa_keluar ?? "", r.nota ?? ""].map((v) => `"${v.replaceAll('"', '""')}"`).join(","))
			.join("\n");
		const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `status-operasi-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(a.href);
	};

	return (
		<div className="mx-auto w-full max-w-[1120px] px-7 py-6">
			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t0}>
				<PageHeader
					crumbs={["Operasi", "Status Operasi"]}
					title="Keberadaan & Status Operasi"
					description={syncedAt ? `Data langsung dari Supabase \u00b7 disegerak ${syncedAt.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })}` : "Memuatkan data langsung\u2026"}
					meta={<LivePill />}
					actions={
						<button
							onClick={exportCsv}
							className="flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-2 text-[12px] font-semibold text-primary shadow-sm transition-colors hover:bg-surface"
						>
							<IconFile className="h-3.5 w-3.5" />
							Eksport CSV
						</button>
					}
				/>
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t1} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Jumlah Staf" value={fmt(stats.total)} sub="Rekod keberadaan" tone="accent" Icon={IconUsers} />
				<StatCard label="Di Pejabat" value={fmt(stats.pejabat)} sub="Hadir bertugas" tone="good" Icon={IconSatellite} />
				<StatCard label="Tugasan Luar" value={fmt(stats.luar)} sub="Operasi / kursus / 4 jam" tone="warn" Icon={IconClock} />
				<StatCard label="Cuti / Tiada" value={fmt(stats.cuti)} sub="Tidak hadir hari ini" tone="risk" Icon={IconUsers} />
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t2} className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
				<SegmentedTabs tabs={tabs} active={tab} onChange={setTab} />
				<label className="flex w-[220px] items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-2 text-[12px] text-secondary focus-within:border-accent">
					<IconSearch className="h-3.5 w-3.5 shrink-0" />
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Cari nama / nota…"
						className="w-full bg-transparent text-primary outline-none placeholder:text-secondary"
						aria-label="Cari nama atau nota"
					/>
				</label>
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t3} className="mt-3">
				<DataTable
					columns={columns}
					rows={filtered}
					loading={loading}
					footerLabel="rekod keberadaan"
					emptyState={
						<EmptyState
							Icon={IconSearch}
							title="Tiada rekod dijumpai"
							description={q ? `Tiada rekod sepadan dengan "${q}".` : "Tiada data operasi, atau capaian disekat oleh RLS Supabase."}
						/>
					}
				/>
			</motion.div>
		</div>
	);
}
