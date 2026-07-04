"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import { PageHeader, LivePill } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState, SegmentedTabs } from "@/components/ui/Meta";
import { IconGraduation, IconClock, IconUsers, IconSearch, IconFile, IconActivity } from "@/components/icons";

// Jadual Supabase sedia ada dari portal asal (status-kursus/index.html):
// kursus(id, user_id, nama, jawatan, gred, cawangan, tajuk_kursus, tarikh, jam, gambar)
export type KursusRow = {
	id: string | number;
	user_id: string | null;
	nama: string | null;
	jawatan: string | null;
	gred: string | null;
	cawangan: string | null;
	tajuk_kursus: string | null;
	tarikh: string | null;
	jam: number | null;
	gambar: string | null;
};

const SASARAN_JAM = 40; // sasaran tahunan LNPT
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const ease = [0.16, 1, 0.3, 1] as const;
const t0 = { duration: 0.35, ease };
const t1 = { duration: 0.35, delay: 0.06, ease };
const t2 = { duration: 0.35, delay: 0.12, ease };
const t3 = { duration: 0.35, delay: 0.18, ease };

function initialsOf(name: string | null): string {
	return (name || "?").split(" ").filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

function yearOf(tarikh: string | null): string {
	const m = (tarikh || "").match(/(20\d\d)/);
	return m ? m[1] : "LAIN";
}

export function StatusKursusView({ auth }: { auth: ReturnType<typeof useAuth> }) {
	const [rows, setRows] = useState<KursusRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("SEMUA");
	const [q, setQ] = useState("");
	const [syncedAt, setSyncedAt] = useState<Date | null>(null);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const r = await auth.sb.from("kursus").select("*").order("tarikh", { ascending: false });
				if (!r.error && r.data) setRows(r.data as KursusRow[]);
			} catch {
				/* RLS / offline: papar empty state */
			}
			setSyncedAt(new Date());
			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const tabs = useMemo(() => {
		const counts = new Map<string, number>();
		for (const r of rows) {
			const y = yearOf(r.tarikh);
			counts.set(y, (counts.get(y) ?? 0) + 1);
		}
		const years = Array.from(counts.entries()).sort((a, b) => b[0].localeCompare(a[0]));
		return [{ key: "SEMUA", label: "Semua", count: rows.length }, ...years.map(([y, n]) => ({ key: y, label: y, count: n }))];
	}, [rows]);

	const filtered = useMemo(() => {
		const needle = q.trim().toLowerCase();
		return rows.filter((r) => {
			const inTab = tab === "SEMUA" || yearOf(r.tarikh) === tab;
			const inQ =
				!needle ||
				(r.nama || "").toLowerCase().includes(needle) ||
				(r.tajuk_kursus || "").toLowerCase().includes(needle);
			return inTab && inQ;
		});
	}, [rows, tab, q]);

	const stats = useMemo(() => {
		const total = rows.length;
		const totalJam = rows.reduce((s, r) => s + (Number(r.jam) || 0), 0);
		const staf = new Set(rows.map((r) => r.user_id || r.nama)).size;
		const purata = staf ? Math.round(totalJam / staf) : 0;
		return { total, totalJam, staf, purata };
	}, [rows]);

	const fmt = (n: number | string) => (loading ? "\u2014" : String(n));

	const columns: Column<KursusRow>[] = [
		{
			key: "nama",
			header: "Nama",
			width: "220px",
			render: (r) => (
				<span className="flex items-center gap-2.5">
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-secondary">
						{initialsOf(r.nama)}
					</span>
					<span className="min-w-0">
						<b className="block truncate font-semibold">{r.nama ?? "\u2014"}</b>
						<span className="text-[11px] text-secondary">{[r.jawatan, r.gred].filter(Boolean).join(" \u00b7 ") || "\u2014"}</span>
					</span>
				</span>
			),
		},
		{ key: "tajuk_kursus", header: "Tajuk Kursus", render: (r) => <span className="font-medium">{r.tajuk_kursus ?? "\u2014"}</span> },
		{
			key: "cawangan",
			header: "Cawangan",
			width: "130px",
			render: (r) =>
				r.cawangan ? <span className="rounded-md bg-surface-2 px-2 py-[3px] text-[11px] font-bold text-secondary">{r.cawangan}</span> : <span className="text-secondary">{"\u2014"}</span>,
		},
		{ key: "tarikh", header: "Tarikh", width: "110px", render: (r) => <span className="tabular-nums text-secondary">{r.tarikh || "\u2014"}</span> },
		{
			key: "jam",
			header: "Jam",
			width: "80px",
			align: "right",
			render: (r) => <b className="tabular-nums font-bold">{Number(r.jam) || 0} j</b>,
		},
	];

	const exportCsv = () => {
		const head = "Nama,Jawatan,Gred,Cawangan,Tajuk Kursus,Tarikh,Jam";
		const body = filtered
			.map((r) =>
				[r.nama ?? "", r.jawatan ?? "", r.gred ?? "", r.cawangan ?? "", r.tajuk_kursus ?? "", r.tarikh ?? "", String(Number(r.jam) || 0)]
					.map((v) => `"${v.replaceAll('"', '""')}"`)
					.join(","),
			)
			.join("\n");
		const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `status-kursus-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(a.href);
	};

	return (
		<div className="mx-auto w-full max-w-[1120px] px-7 py-6">
			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t0}>
				<PageHeader
					crumbs={["Jadual", "Status Kursus"]}
					title="Rekod Kursus & Latihan"
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
				<StatCard label="Jumlah Kursus" value={fmt(stats.total)} sub="Rekod latihan direkodkan" tone="accent" Icon={IconGraduation} />
				<StatCard label="Jumlah Jam" value={loading ? "\u2014" : `${stats.totalJam} j`} sub="Terkumpul keseluruhan" tone="good" Icon={IconClock} />
				<StatCard label="Staf Terlibat" value={fmt(stats.staf)} sub="Individu dengan rekod" tone="accent" Icon={IconUsers} />
				<StatCard label="Purata / Staf" value={loading ? "\u2014" : `${stats.purata} j`} sub={`Sasaran LNPT: ${SASARAN_JAM} jam`} tone={stats.purata >= SASARAN_JAM ? "good" : "warn"} Icon={IconActivity} />
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t2} className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
				<SegmentedTabs tabs={tabs} active={tab} onChange={setTab} />
				<label className="flex w-[220px] items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-2 text-[12px] text-secondary focus-within:border-accent">
					<IconSearch className="h-3.5 w-3.5 shrink-0" />
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Cari nama / tajuk…"
						className="w-full bg-transparent text-primary outline-none placeholder:text-secondary"
						aria-label="Cari nama atau tajuk kursus"
					/>
				</label>
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t3} className="mt-3">
				<DataTable
					columns={columns}
					rows={filtered}
					loading={loading}
					footerLabel="rekod kursus"
					emptyState={
						<EmptyState
							Icon={IconSearch}
							title="Tiada rekod dijumpai"
							description={q ? `Tiada rekod sepadan dengan "${q}".` : "Tiada data kursus, atau capaian disekat oleh RLS Supabase."}
						/>
					}
				/>
			</motion.div>
		</div>
	);
}
