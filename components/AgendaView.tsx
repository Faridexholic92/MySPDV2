"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import { PageHeader, LivePill } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill, EmptyState, SegmentedTabs, type PillTone } from "@/components/ui/Meta";
import { IconCalendar, IconCheckCircle, IconClock, IconSearch, IconFile } from "@/components/icons";

// Jadual Supabase sedia ada dari portal asal (agenda-myspd/index.html):
// agenda(id, tajuk, tarikh, lokasi, status, nota)
export type AgendaRow = {
	id: string | number;
	tajuk: string | null;
	tarikh: string | null;
	lokasi: string | null;
	status: string | null;
	nota: string | null;
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const ease = [0.16, 1, 0.3, 1] as const;
const t0 = { duration: 0.35, ease };
const t1 = { duration: 0.35, delay: 0.06, ease };
const t2 = { duration: 0.35, delay: 0.12, ease };
const t3 = { duration: 0.35, delay: 0.18, ease };

function startOfToday(): Date {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d;
}

function agendaInfo(r: AgendaRow): { label: string; tone: PillTone; group: string } {
	const s = (r.status || "").toUpperCase();
	if (s.includes("BATAL") || s.includes("TANGGUH")) return { label: r.status || "Ditangguh", tone: "risk", group: "LAIN" };
	const d = r.tarikh ? new Date(r.tarikh) : null;
	if (d && !Number.isNaN(d.getTime()) && d >= startOfToday()) return { label: "Akan Datang", tone: "accent", group: "DATANG" };
	return { label: "Selesai", tone: "neutral", group: "SELESAI" };
}

export function AgendaView({ auth }: { auth: ReturnType<typeof useAuth> }) {
	const [rows, setRows] = useState<AgendaRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("SEMUA");
	const [q, setQ] = useState("");
	const [syncedAt, setSyncedAt] = useState<Date | null>(null);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const r = await auth.sb.from("agenda").select("*").order("tarikh", { ascending: false });
				if (!r.error && r.data) setRows(r.data as AgendaRow[]);
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
		const datang = rows.filter((r) => agendaInfo(r).group === "DATANG").length;
		const selesai = rows.filter((r) => agendaInfo(r).group === "SELESAI").length;
		const now = new Date();
		const bulanIni = rows.filter((r) => {
			if (!r.tarikh) return false;
			const d = new Date(r.tarikh);
			return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
		}).length;
		return { total, datang, selesai, bulanIni };
	}, [rows]);

	const tabs = useMemo(
		() => [
			{ key: "SEMUA", label: "Semua", count: stats.total },
			{ key: "DATANG", label: "Akan Datang", count: stats.datang },
			{ key: "SELESAI", label: "Selesai", count: stats.selesai },
		],
		[stats],
	);

	const filtered = useMemo(() => {
		const needle = q.trim().toLowerCase();
		return rows.filter((r) => {
			const inTab = tab === "SEMUA" || agendaInfo(r).group === tab;
			const inQ =
				!needle ||
				(r.tajuk || "").toLowerCase().includes(needle) ||
				(r.lokasi || "").toLowerCase().includes(needle);
			return inTab && inQ;
		});
	}, [rows, tab, q]);

	const fmt = (n: number) => (loading ? "\u2014" : String(n));
	const fmtDate = (d: string | null) =>
		d ? new Date(d).toLocaleDateString("ms-MY", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) : "\u2014";

	const columns: Column<AgendaRow>[] = [
		{ key: "tarikh", header: "Tarikh", width: "170px", render: (r) => <span className="tabular-nums font-semibold">{fmtDate(r.tarikh)}</span> },
		{ key: "tajuk", header: "Agenda", render: (r) => <b className="font-semibold">{r.tajuk ?? "\u2014"}</b> },
		{ key: "lokasi", header: "Lokasi", width: "180px", render: (r) => <span className="text-secondary">{r.lokasi || "\u2014"}</span> },
		{
			key: "status",
			header: "Status",
			width: "130px",
			render: (r) => {
				const s = agendaInfo(r);
				return <StatusPill tone={s.tone}>{s.label}</StatusPill>;
			},
		},
		{ key: "nota", header: "Nota", width: "200px", render: (r) => <span className="block truncate text-secondary">{r.nota || "\u2014"}</span> },
	];

	const exportCsv = () => {
		const head = "Tarikh,Agenda,Lokasi,Status,Nota";
		const body = filtered
			.map((r) => [r.tarikh ?? "", r.tajuk ?? "", r.lokasi ?? "", agendaInfo(r).label, r.nota ?? ""].map((v) => `"${v.replaceAll('"', '""')}"`).join(","))
			.join("\n");
		const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `agenda-myspd-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(a.href);
	};

	return (
		<div className="mx-auto w-full max-w-[1200px] px-8 py-8">
			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t0}>
				<PageHeader
					crumbs={["Jadual", "Agenda MySPD"]}
					title="Takwim & Agenda Seksyen"
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

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t1} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Jumlah Agenda" value={fmt(stats.total)} sub="Keseluruhan direkodkan" tone="accent" Icon={IconCalendar} />
				<StatCard label="Akan Datang" value={fmt(stats.datang)} sub="Dari hari ini ke hadapan" tone="good" Icon={IconClock} />
				<StatCard label="Bulan Ini" value={fmt(stats.bulanIni)} sub="Agenda bulan semasa" tone="warn" Icon={IconCalendar} />
				<StatCard label="Selesai" value={fmt(stats.selesai)} sub="Agenda lepas" tone="neutral" Icon={IconCheckCircle} />
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t2} className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
				<SegmentedTabs tabs={tabs} active={tab} onChange={setTab} />
				<label className="flex w-[220px] items-center gap-2 rounded-lg glass-card px-3 py-2 text-[13px] text-secondary focus-within:border-accent">
					<IconSearch className="h-3.5 w-3.5 shrink-0" />
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Cari agenda / lokasi…"
						className="w-full bg-transparent text-primary outline-none placeholder:text-secondary"
						aria-label="Cari agenda atau lokasi"
					/>
				</label>
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t3} className="mt-3">
				<DataTable
					columns={columns}
					rows={filtered}
					loading={loading}
					footerLabel="agenda"
					emptyState={
						<EmptyState
							Icon={IconSearch}
							title="Tiada agenda dijumpai"
							description={q ? `Tiada agenda sepadan dengan "${q}".` : "Tiada data agenda, atau capaian disekat oleh RLS Supabase."}
						/>
					}
				/>
			</motion.div>
		</div>
	);
}
