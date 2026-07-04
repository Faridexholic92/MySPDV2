"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import type { AuthedUser } from "@/lib/types";
import {
	IconActivity,
	IconFile,
	IconCalendar,
	IconCheckCircle,
	IconGift,
	IconGraduation,
	IconClipboard,
	IconClock,
	IconSatellite,
	IconUsers,
	IconBell,
} from "@/components/icons";

// Modul & penerangan sebenar diambil terus daripada grid "Modul Utama"
// portal asal (index.html) supaya konsisten dengan sistem sedia ada.
const MODULES: Array<{ label: string; desc: string; Icon: typeof IconActivity; view?: "status-spd" }> = [
	{ label: "Status Semasa SPD", desc: "Sistem pemantauan & ringkasan semasa.", Icon: IconActivity, view: "status-spd" },
	{ label: "Dokumen Rasmi", desc: "SOP, manual, minit.", Icon: IconFile },
	{ label: "Agenda MySPD", desc: "Takwim & aktiviti.", Icon: IconCalendar },
	{ label: "EKSA MySPD", desc: "Eviden & audit.", Icon: IconCheckCircle },
	{ label: "Perayaan", desc: "E-kad & hebahan.", Icon: IconGift },
	{ label: "Status Kursus", desc: "Rekod latihan & 40 jam.", Icon: IconGraduation },
	{ label: "Status BDR", desc: "Rekod tugasan BDR.", Icon: IconClipboard },
	{ label: "Borang 4 Jam", desc: "Kebenaran tinggal pejabat.", Icon: IconClock },
	{ label: "Status Operasi", desc: "Perhubungan & keberadaan.", Icon: IconSatellite },
];

const TK_MON = [
	"Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis",
];

type Pengumuman = { tajuk: string; tarikh: string | null; jenis: string | null; status: string | null };
type Birthday = { nama: string; day: number; month: number };

const fadeUpHidden = { opacity: 0, y: 14 };
const fadeUpShow = { opacity: 1, y: 0 };
const easeCurve = [0.16, 1, 0.3, 1] as const;
const skeletonPulse = "animate-pulse rounded bg-surface-2";

function useDelay(seconds: number) {
	return { duration: 0.4, delay: seconds, ease: easeCurve };
}

function formatTarikh(t: string | null): string {
	if (!t) return "";
	try {
		const d = new Date(t);
		if (isNaN(d.getTime())) return t;
		return `${d.getDate()} ${TK_MON[d.getMonth()]} ${d.getFullYear()}`;
	} catch {
		return t;
	}
}

// NOTE (data): Statistik dan pengumuman di bawah ditarik terus dari jadual
// Supabase sedia ada dalam portal asal (skt_lembar, bdr, profiles,
// pengumuman) -- bukan lagi angka rekaan. Kalau jadual ini tiada/RLS
// menyekat, kad akan papar "\u2014" (sama macam gelagat portal asal).
export function DashboardView({
	user,
	auth,
	onOpenModule,
}: {
	user: AuthedUser;
	auth: ReturnType<typeof useAuth>;
	onOpenModule?: (v: "status-spd") => void;
}) {
	const firstName = (user.name || "").split(" ")[0] || user.name;
	const [loading, setLoading] = useState(true);
	const [statSpd, setStatSpd] = useState<number | null>(null);
	const [statBdr, setStatBdr] = useState<number | null>(null);
	const [statJumlah, setStatJumlah] = useState<number | null>(null);
	const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
	const [birthdays, setBirthdays] = useState<Birthday[]>([]);

	useEffect(() => {
		(async () => {
			setLoading(true);
			const sb = auth.sb;

			try {
				const r = await sb.from("skt_lembar").select("*", { count: "exact", head: true });
				setStatSpd(typeof r.count === "number" ? r.count : null);
			} catch {
				setStatSpd(null);
			}
			try {
				const r = await sb.from("bdr").select("*", { count: "exact", head: true }).eq("menolak_bdr", false).gt("jarak", 8);
				setStatBdr(typeof r.count === "number" ? r.count : null);
			} catch {
				setStatBdr(null);
			}
			try {
				const r = await sb.from("profiles").select("*", { count: "exact", head: true });
				setStatJumlah(typeof r.count === "number" ? r.count : null);
			} catch {
				setStatJumlah(null);
			}
			try {
				const r = await sb.from("pengumuman").select("*").order("tarikh", { ascending: false }).limit(5);
				if (!r.error && r.data) setPengumuman(r.data as Pengumuman[]);
			} catch {
				/* ignore */
			}
			try {
				const r = await sb.from("profiles").select("nama,tarikh_lahir").not("tarikh_lahir", "is", null);
				if (!r.error && r.data) {
					const now = new Date();
					const mon = now.getMonth() + 1;
					const list = (r.data as Array<{ nama: string; tarikh_lahir: string }>)
						.map((p) => {
							const d = new Date(p.tarikh_lahir);
							if (isNaN(d.getTime())) return null;
							return { nama: p.nama, month: d.getMonth() + 1, day: d.getDate() };
						})
						.filter((x): x is Birthday => !!x && x.month === mon)
						.sort((a, b) => a.day - b.day);
					setBirthdays(list);
				}
			} catch {
				/* ignore */
			}

			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fmt = (n: number | null) => (n == null ? "\u2014" : String(n));
	const today = new Date();

	const STATS = [
		{ label: "Status SPD", value: fmt(statSpd), sub: "Lembar SKT Seksyen", Icon: IconActivity, tone: "accent" as const },
		{ label: "Status BDR", value: fmt(statBdr), sub: "Layak BDR (>8km)", Icon: IconClipboard, tone: "warn" as const },
		{ label: "Jumlah Pengguna", value: fmt(statJumlah), sub: "Keseluruhan", Icon: IconUsers, tone: "good" as const },
	];

	const toneClasses: Record<string, string> = {
		accent: "bg-accent-soft text-accent",
		good: "bg-good-soft text-good",
		warn: "bg-warn-soft text-warn",
	};

	return (
		<div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[1180px] flex-col px-7 py-7">
			<motion.div initial={fadeUpHidden} animate={fadeUpShow} transition={useDelay(0)} className="mb-5">
				<h1 className="mb-0.5 text-[21px] font-extrabold tracking-tight">Selamat kembali, {firstName}.</h1>
				<p className="text-[12.5px] text-secondary">
					{today.toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
				</p>
			</motion.div>

			<div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
				{STATS.map((s, i) => (
					<motion.div
						key={s.label}
						initial={fadeUpHidden}
						animate={fadeUpShow}
						transition={useDelay(0.06 + i * 0.05)}
						className="rounded-lg border border-border bg-canvas p-4 shadow-sm"
					>
						<div className="mb-2 flex items-center justify-between">
							<span className="text-[11px] font-bold uppercase tracking-wide text-secondary">{s.label}</span>
							<div className={`flex h-7 w-7 items-center justify-center rounded-md ${toneClasses[s.tone]}`}>
								<s.Icon className="h-3.5 w-3.5" />
							</div>
						</div>
						{loading ? (
							<div className={`h-7 w-14 ${skeletonPulse}`} />
						) : (
							<b className="block text-[23px] font-extrabold tracking-tight">{s.value}</b>
						)}
						<span className="text-[11px] text-secondary">{s.sub}</span>
					</motion.div>
				))}
			</div>

			<div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
				<motion.div
					initial={fadeUpHidden}
					animate={fadeUpShow}
					transition={useDelay(0.24)}
					className="rounded-lg border border-border bg-canvas p-5 shadow-sm"
				>
					<h2 className="mb-3 flex items-center gap-2 text-[13.5px] font-extrabold">
						<IconBell className="h-3.5 w-3.5 text-secondary" />
						Pengumuman Terkini
					</h2>
					{loading ? (
						<div className="space-y-2">
							{[0, 1, 2].map((i) => (
								<div key={i} className={`h-10 ${skeletonPulse}`} />
							))}
						</div>
					) : pengumuman.length === 0 ? (
						<div className="py-6 text-center text-xs text-secondary">Tiada pengumuman.</div>
					) : (
						pengumuman.map((p, i) => (
							<div key={i} className={`py-2.5 ${i < pengumuman.length - 1 ? "border-b border-border" : ""}`}>
								<b className="block text-[12.5px] font-bold">{p.tajuk || "-"}</b>
								<span className="text-[11px] text-secondary">
									{formatTarikh(p.tarikh)}
									{p.status ? ` \u2022 ${p.status}` : ""}
								</span>
							</div>
						))
					)}
				</motion.div>

				<motion.div
					initial={fadeUpHidden}
					animate={fadeUpShow}
					transition={useDelay(0.3)}
					className="rounded-lg border border-border bg-canvas p-5 shadow-sm"
				>
					<h2 className="mb-3 text-[13.5px] font-extrabold">Hari Lahir Bulan Ini</h2>
					{loading ? (
						<div className="space-y-2">
							{[0, 1].map((i) => (
								<div key={i} className={`h-8 ${skeletonPulse}`} />
							))}
						</div>
					) : birthdays.length === 0 ? (
						<div className="py-6 text-center text-xs text-secondary">Tiada hari lahir bulan ini.</div>
					) : (
						birthdays.map((b, i) => {
							const isToday = b.day === today.getDate();
							return (
								<div key={i} className={`py-2 ${i < birthdays.length - 1 ? "border-b border-border" : ""}`}>
									<b className="block text-[12.5px] font-bold">
										{b.nama} {isToday ? "\ud83c\udf89" : ""}
									</b>
									<span className="text-[11px] text-secondary">
										Hari Lahir {b.day} {TK_MON[b.month - 1]}
										{isToday ? " \u2014 Hari Ini!" : ""}
									</span>
								</div>
							);
						})
					)}
				</motion.div>
			</div>

			<motion.h2
				initial={fadeUpHidden}
				animate={fadeUpShow}
				transition={useDelay(0.36)}
				className="mb-3 text-[13.5px] font-extrabold"
			>
				Modul Utama
			</motion.h2>
			<div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{MODULES.map((m, i) => (
					<motion.div
						key={m.label}
						initial={fadeUpHidden}
						animate={fadeUpShow}
						transition={useDelay(0.4 + i * 0.03)}
						onClick={m.view && onOpenModule ? () => onOpenModule(m.view as "status-spd") : undefined}
						title={m.view ? undefined : "Modul ini belum dibina dalam remake teras ini"}
						className={
							m.view
								? "flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-canvas p-3.5 shadow-sm transition-colors hover:border-accent"
								: "flex cursor-not-allowed items-center gap-3 rounded-lg border border-border bg-canvas p-3.5 opacity-70 shadow-sm"
						}
					>
						<div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-surface text-primary">
							<m.Icon className="h-4 w-4" />
						</div>
						<div>
							<h3 className="text-[12.5px] font-bold">{m.label}</h3>
							<p className="text-[11px] text-secondary">{m.desc}</p>
						</div>
					</motion.div>
				))}
			</div>

			<footer className="mt-auto flex flex-col gap-1 border-t border-border pt-4 text-[11px] text-secondary sm:flex-row sm:items-center sm:justify-between">
				<span>&copy; 2026 MYSPD. Hakcipta Terpelihara.</span>
				<span>Versi 2.0.0 &middot; Seksyen Penawanan Data</span>
			</footer>
		</div>
	);
}
