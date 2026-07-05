"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import { PageHeader, LivePill } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill, ProgressBar, EmptyState, SegmentedTabs, type PillTone } from "@/components/ui/Meta";
import { IconActivity, IconCheckCircle, IconClock, IconSearch, IconFile } from "@/components/icons";

// Jadual Supabase sedia ada dari portal asal (status-semasa-spd/index.html):
// skt_lembar(id, pegawai, tarikh_mula, progress, kategori, susunan)
export type SktLembar = {
	id: string | number;
	pegawai: string | null;
	tarikh_mula: string | null;
	progress: number | null;
	kategori: string | null;
	susunan: number | null;
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const ease = [0.16, 1, 0.3, 1] as const;
const t0 = { duration: 0.35, ease };
const t1 = { duration: 0.35, delay: 0.06, ease };
const t2 = { duration: 0.35, delay: 0.12, ease };
const t3 = { duration: 0.35, delay: 0.18, ease };

function statusOf(r: SktLembar): { label: string; tone: PillTone } {
	const p = r.progress ?? 0;
	const pending = !r.tarikh_mula || r.tarikh_mula.toUpperCase() === "PENDING";
	if (p >= 100) return { label: "Selesai", tone: "good" };
	if (pending || p === 0) return { label: "Menunggu", tone: "warn" };
	return { label: "Dalam Proses", tone: "accent" };
}

function initialsOf(name: string | null): string {
	return (name || "?")
		.split(" ")
		.filter(Boolean)
		.map((s) => s[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export function StatusSpdView({ auth }: { auth: ReturnType<typeof useAuth> }) {
	const [rows, setRows] = useState<SktLembar[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("SEMUA");
	const [q, setQ] = useState("");
	const [syncedAt, setSyncedAt] = useState<Date | null>(null);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const r = await auth.sb
					.from("skt_lembar")
					.select("*")
					.order("kategori", { ascending: true })
					.order("susunan", { ascending: true });
				if (!r.error && r.data) setRows(r.data as SktLembar[]);
			} catch {
				/* RLS / offline: papar empty state */
			}
			setSyncedAt(new Date());
			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Tab kategori dibina data-driven dari nilai sebenar dalam jadual.
	const tabs = useMemo(() => {
		const counts = new Map<string, number>();
		for (const r of rows) {
			const k = (r.kategori || "LAIN").toUpperCase();
			counts.set(k, (counts.get(k) ?? 0) + 1);
		}
		return [
			{ key: "SEMUA", label: "Semua", count: rows.length },
			...Array.from(counts.entries()).map(([k, n]) => ({ key: k, label: k.charAt(0) + k.slice(1).toLowerCase(), count: n })),
		];
	}, [rows]);

	const filtered = useMemo(() => {
		const needle = q.trim().toLowerCase();
		return rows.filter((r) => {
			const inTab = tab === "SEMUA" || (r.kategori || "LAIN").toUpperCase() === tab;
			const inQ = !needle || (r.pegawai || "").toLowerCase().includes(needle);
			return inTab && inQ;
		});
	}, [rows, tab, q]);

	const stats = useMemo(() => {
		const total = rows.length;
		const done = rows.filter((r) => (r.progress ?? 0) >= 100).length;
		const active = rows.filter((r) => (r.progress ?? 0) > 0 && (r.progress ?? 0) < 100).length;
		const avg = total ? Math.round(rows.reduce((s, r) => s + (r.progress ?? 0), 0) / total) : 0;
		return { total, done, active, avg };
	}, [rows]);

	const fmt = (n: number) => (loading ? "\u2014" : String(n));

	const columns: Column<SktLembar>[] = [
		{
			key: "pegawai",
			header: "Pegawai",
			render: (r) => (
				<span className="flex items-center gap-2.5">
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-secondary">
						{initialsOf(r.pegawai)}
					</span>
					<b className="font-semibold">{r.pegawai ?? "\u2014"}</b>
				</span>
			),
		},
		{
			key: "kategori",
			header: "Kategori",
			width: "130px",
			render: (r) => <span className="rounded-md bg-surface-2 px-2 py-[3px] text-[11px] font-bold text-secondary">{(r.kategori || "LAIN").toUpperCase()}</span>,
		},
		{
			key: "tarikh_mula",
			header: "Tarikh Mula",
			width: "120px",
			render: (r) => <span className="tabular-nums text-secondary">{r.tarikh_mula || "\u2014"}</span>,
		},
		{
			key: "progress",
			header: "Kemajuan",
			width: "200px",
			render: (r) => <ProgressBar value={r.progress ?? 0} />,
		},
		{
			key: "status",
			header: "Status",
			width: "130px",
			render: (r) => {
				const s = statusOf(r);
				return <StatusPill tone={s.tone}>{s.label}</StatusPill>;
			},
		},
	];

	const exportCsv = () => {
		const head = "Pegawai,Kategori,Tarikh Mula,Progress";
		const body = filtered
			.map((r) => [r.pegawai ?? "", (r.kategori || "").toUpperCase(), r.tarikh_mula ?? "", String(r.progress ?? 0)].map((v) => `"${v.replaceAll('"', '""')}"`).join(","))
			.join("\n");
		const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `skt-lembar-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(a.href);
	};

	return (
		<div className="mx-auto w-full max-w-[1200px] px-8 py-8">
			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t0}>
				<PageHeader
					crumbs={["Operasi", "Status Semasa SPD"]}
					title="Status Sasaran Kerja Tahunan"
					description={syncedAt ? `Data langsung dari Supabase \u00b7 disegerak ${syncedAt.toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })}` : "Memuatkan data langsung\u2026"}
					meta={<LivePill />}
					actions={
						<button
							onClick={exportCsv}
							className="flex items-center gap-2 rounded-lg glass-card px-3 py-2 text-[13px] font-semibold text-primary shadow-sm transition-colors hover:bg-surface"
						>
							<IconFile className="h-3.5 w-3.5" />
							Eksport CSV
						</button>
					}
				/>
			</motion.div>

			<motion.div
				variants={fadeUp}
				initial="hidden"
				animate="show"
				transition={t1}
				className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
			>
				<StatCard label="Jumlah Lembar" value={fmt(stats.total)} sub="Semua kategori SKT" tone="accent" Icon={IconActivity} />
				<StatCard label="Selesai" value={fmt(stats.done)} sub="Progress 100%" tone="good" Icon={IconCheckCircle} />
				<StatCard label="Dalam Proses" value={fmt(stats.active)} sub="Sedang dikerjakan" tone="warn" Icon={IconClock} />
				<StatCard label="Purata Kemajuan" value={loading ? "\u2014" : `${stats.avg}%`} sub="Keseluruhan seksyen" tone="accent" Icon={IconActivity} />
			</motion.div>

			<motion.div
				variants={fadeUp}
				initial="hidden"
				animate="show"
				transition={t2}
				className="mt-5 flex flex-wrap items-center justify-between gap-2.5"
			>
				<SegmentedTabs tabs={tabs} active={tab} onChange={setTab} />
				<label className="flex w-[220px] items-center gap-2 rounded-lg glass-card px-3 py-2 text-[13px] text-secondary focus-within:border-accent">
					<IconSearch className="h-3.5 w-3.5 shrink-0" />
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Cari pegawai…"
						className="w-full bg-transparent text-primary outline-none placeholder:text-secondary"
						aria-label="Cari pegawai"
					/>
				</label>
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t3} className="mt-3">
				<DataTable
					columns={columns}
					rows={filtered}
					loading={loading}
					footerLabel="lembar"
					emptyState={
						<EmptyState
							Icon={IconSearch}
							title="Tiada rekod dijumpai"
							description={q ? `Tiada pegawai sepadan dengan "${q}". Cuba kata kunci lain.` : "Tiada data dalam kategori ini, atau capaian disekat oleh RLS Supabase."}
						/>
					}
				/>
			</motion.div>
		</div>
	);
}
