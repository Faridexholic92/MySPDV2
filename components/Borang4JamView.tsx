"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import { PageHeader, LivePill } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill, EmptyState, SegmentedTabs, type PillTone } from "@/components/ui/Meta";
import { IconClock, IconCheckCircle, IconClipboard, IconSearch, IconFile } from "@/components/icons";

// Jadual Supabase sedia ada dari portal asal (borang-4jam/index.html):
// borang_4jam(id, user_id, status, approve_date, apply_date, start_time, end_time,
//   purpose_type, purpose_detail, applicant_name, applicant_position,
//   supervisor_name, supervisor_position, created_at)
export type Borang4JamRow = {
	id: string | number;
	status: string | null;
	approve_date: string | null;
	apply_date: string | null;
	start_time: string | null;
	end_time: string | null;
	purpose_type: string | null;
	purpose_detail: string | null;
	applicant_name: string | null;
	applicant_position: string | null;
	supervisor_name: string | null;
	supervisor_position: string | null;
	created_at: string | null;
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const ease = [0.16, 1, 0.3, 1] as const;
const t0 = { duration: 0.35, ease };
const t1 = { duration: 0.35, delay: 0.06, ease };
const t2 = { duration: 0.35, delay: 0.12, ease };
const t3 = { duration: 0.35, delay: 0.18, ease };

// Status disimpan sebagai teks bebas; padankan ikut kata kunci.
function statusInfo(r: Borang4JamRow): { label: string; tone: PillTone; group: string } {
	const s = (r.status || "").toUpperCase();
	if (s.includes("LULUS") || s.includes("APPROVE") || r.approve_date) return { label: "Diluluskan", tone: "good", group: "LULUS" };
	if (s.includes("TOLAK") || s.includes("BATAL") || s.includes("REJECT")) return { label: "Ditolak", tone: "risk", group: "TOLAK" };
	return { label: "Menunggu", tone: "warn", group: "MENUNGGU" };
}

function initialsOf(name: string | null): string {
	return (name || "?").split(" ").filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

export function Borang4JamView({ auth }: { auth: ReturnType<typeof useAuth> }) {
	const [rows, setRows] = useState<Borang4JamRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("SEMUA");
	const [q, setQ] = useState("");
	const [syncedAt, setSyncedAt] = useState<Date | null>(null);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const r = await auth.sb.from("borang_4jam").select("*").order("created_at", { ascending: false });
				if (!r.error && r.data) setRows(r.data as Borang4JamRow[]);
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
		const lulus = rows.filter((r) => statusInfo(r).group === "LULUS").length;
		const tunggu = rows.filter((r) => statusInfo(r).group === "MENUNGGU").length;
		const now = new Date();
		const bulanIni = rows.filter((r) => {
			const d = r.apply_date || r.created_at;
			if (!d) return false;
			const dt = new Date(d);
			return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
		}).length;
		return { total, lulus, tunggu, tolak: total - lulus - tunggu, bulanIni };
	}, [rows]);

	const tabs = useMemo(
		() => [
			{ key: "SEMUA", label: "Semua", count: stats.total },
			{ key: "LULUS", label: "Diluluskan", count: stats.lulus },
			{ key: "MENUNGGU", label: "Menunggu", count: stats.tunggu },
			{ key: "TOLAK", label: "Ditolak", count: stats.tolak },
		],
		[stats],
	);

	const filtered = useMemo(() => {
		const needle = q.trim().toLowerCase();
		return rows.filter((r) => {
			const inTab = tab === "SEMUA" || statusInfo(r).group === tab;
			const inQ =
				!needle ||
				(r.applicant_name || "").toLowerCase().includes(needle) ||
				(r.purpose_type || "").toLowerCase().includes(needle) ||
				(r.purpose_detail || "").toLowerCase().includes(needle);
			return inTab && inQ;
		});
	}, [rows, tab, q]);

	const fmt = (n: number) => (loading ? "\u2014" : String(n));
	const fmtDate = (d: string | null) =>
		d ? new Date(d).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" }) : "\u2014";

	const columns: Column<Borang4JamRow>[] = [
		{
			key: "applicant_name",
			header: "Pemohon",
			width: "210px",
			render: (r) => (
				<span className="flex items-center gap-2.5">
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-secondary">
						{initialsOf(r.applicant_name)}
					</span>
					<span className="min-w-0">
						<b className="block truncate font-semibold">{r.applicant_name ?? "\u2014"}</b>
						<span className="text-[11px] text-secondary">{r.applicant_position || "\u2014"}</span>
					</span>
				</span>
			),
		},
		{
			key: "purpose",
			header: "Tujuan",
			render: (r) => (
				<span className="min-w-0">
					<b className="block font-semibold">{r.purpose_type || "\u2014"}</b>
					{r.purpose_detail && <span className="block truncate text-[11px] text-secondary">{r.purpose_detail}</span>}
				</span>
			),
		},
		{ key: "apply_date", header: "Tarikh Mohon", width: "120px", render: (r) => <span className="tabular-nums text-secondary">{fmtDate(r.apply_date || r.created_at)}</span> },
		{
			key: "masa",
			header: "Masa",
			width: "120px",
			render: (r) => (
				<span className="tabular-nums text-secondary">{r.start_time ? `${r.start_time}${r.end_time ? ` \u2013 ${r.end_time}` : ""}` : "\u2014"}</span>
			),
		},
		{ key: "supervisor_name", header: "Penyelia", width: "170px", render: (r) => <span className="text-secondary">{r.supervisor_name || "\u2014"}</span> },
		{
			key: "status",
			header: "Status",
			width: "120px",
			render: (r) => {
				const s = statusInfo(r);
				return <StatusPill tone={s.tone}>{s.label}</StatusPill>;
			},
		},
	];

	const exportCsv = () => {
		const head = "Pemohon,Jawatan,Tujuan,Butiran,Tarikh Mohon,Masa Mula,Masa Tamat,Penyelia,Status";
		const body = filtered
			.map((r) =>
				[
					r.applicant_name ?? "",
					r.applicant_position ?? "",
					r.purpose_type ?? "",
					r.purpose_detail ?? "",
					r.apply_date ?? "",
					r.start_time ?? "",
					r.end_time ?? "",
					r.supervisor_name ?? "",
					statusInfo(r).label,
				]
					.map((v) => `"${v.replaceAll('"', '""')}"`)
					.join(","),
			)
			.join("\n");
		const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `borang-4jam-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(a.href);
	};

	return (
		<div className="mx-auto w-full max-w-[1200px] px-8 py-8">
			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t0}>
				<PageHeader
					crumbs={["Dokumen", "Borang 4 Jam"]}
					title="Permohonan Kebenaran 4 Jam"
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
				<StatCard label="Jumlah Permohonan" value={fmt(stats.total)} sub="Keseluruhan direkodkan" tone="accent" Icon={IconClipboard} />
				<StatCard label="Diluluskan" value={fmt(stats.lulus)} sub="Permohonan berjaya" tone="good" Icon={IconCheckCircle} />
				<StatCard label="Menunggu" value={fmt(stats.tunggu)} sub="Belum diproses" tone="warn" Icon={IconClock} />
				<StatCard label="Bulan Ini" value={fmt(stats.bulanIni)} sub="Permohonan bulan semasa" tone="accent" Icon={IconClipboard} />
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t2} className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
				<SegmentedTabs tabs={tabs} active={tab} onChange={setTab} />
				<label className="flex w-[220px] items-center gap-2 rounded-lg glass-card px-3 py-2 text-[13px] text-secondary focus-within:border-accent">
					<IconSearch className="h-3.5 w-3.5 shrink-0" />
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Cari pemohon / tujuan…"
						className="w-full bg-transparent text-primary outline-none placeholder:text-secondary"
						aria-label="Cari pemohon atau tujuan"
					/>
				</label>
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t3} className="mt-3">
				<DataTable
					columns={columns}
					rows={filtered}
					loading={loading}
					footerLabel="permohonan"
					emptyState={
						<EmptyState
							Icon={IconSearch}
							title="Tiada permohonan dijumpai"
							description={q ? `Tiada permohonan sepadan dengan "${q}".` : "Tiada data permohonan, atau capaian disekat oleh RLS Supabase."}
						/>
					}
				/>
			</motion.div>
		</div>
	);
}
