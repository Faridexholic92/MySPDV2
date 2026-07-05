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

type ModuleView = Exclude<import("@/components/Sidebar").ViewKey, "dashboard" | "admin">;

const MODULES: Array<{ label: string; desc: string; Icon: typeof IconActivity; view?: ModuleView }> = [
	{ label: "Status Semasa SPD", desc: "Pemantauan & ringkasan.", Icon: IconActivity, view: "status-spd" },
	{ label: "Dokumen Rasmi", desc: "SOP, manual, minit.", Icon: IconFile, view: "dokumen" },
	{ label: "Agenda MySPD", desc: "Takwim & aktiviti.", Icon: IconCalendar, view: "agenda" },
	{ label: "EKSA MySPD", desc: "Eviden & audit.", Icon: IconCheckCircle, view: "eksa" },
	{ label: "Perayaan", desc: "E-kad & hebahan.", Icon: IconGift, view: "perayaan" },
	{ label: "Status Kursus", desc: "Latihan & 40 jam.", Icon: IconGraduation, view: "status-kursus" },
	{ label: "Status BDR", desc: "Rekod tugasan BDR.", Icon: IconClipboard, view: "status-bdr" },
	{ label: "Borang 4 Jam", desc: "Kebenaran tinggal pejabat.", Icon: IconClock, view: "borang-4jam" },
	{ label: "Status Operasi", desc: "Keberadaan pegawai.", Icon: IconSatellite, view: "status-operasi" },
];

const TK_MON = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

type Pengumuman = { tajuk: string; tarikh: string | null; jenis: string | null; status: string | null };
type Birthday = { nama: string; day: number; month: number };

const fadeUpHidden = { opacity: 0, y: 14 };
const fadeUpShow = { opacity: 1, y: 0 };
const easeCurve = [0.16, 1, 0.3, 1] as const;
const t0 = { duration: 0.4, delay: 0, ease: easeCurve };
const t1 = { duration: 0.4, delay: 0.06, ease: easeCurve };
const t2 = { duration: 0.4, delay: 0.12, ease: easeCurve };
const t3 = { duration: 0.4, delay: 0.18, ease: easeCurve };
const t4 = { duration: 0.4, delay: 0.24, ease: easeCurve };
const glowDot = { boxShadow: "0 0 8px rgba(79,93,255,0.8)" };
const heroBtn = { background: "rgba(255,255,255,0.14)" };

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

// Data ditarik terus dari jadual Supabase portal asal (skt_lembar, bdr,
// profiles, pengumuman, agenda). Jika jadual tiada / RLS menyekat, kad
// papar sengkang dan carta papar keadaan kosong (tidak crash).
export function DashboardView({
	user,
	auth,
	onOpenModule,
}: {
	user: AuthedUser;
	auth: ReturnType<typeof useAuth>;
	onOpenModule?: (v: ModuleView) => void;
}) {
	const firstName = (user.name || "").split(" ")[0] || user.name;
	const [statSpd, setStatSpd] = useState<number | null>(null);
	const [statBdr, setStatBdr] = useState<number | null>(null);
	const [statBdrTotal, setStatBdrTotal] = useState<number | null>(null);
	const [statJumlah, setStatJumlah] = useState<number | null>(null);
	const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
	const [birthdays, setBirthdays] = useState<Birthday[]>([]);
	const [agendaMonths, setAgendaMonths] = useState<number[] | null>(null);

	useEffect(() => {
		(async () => {
			const sb = auth.sb;
			try {
				const r = await sb.from("skt_lembar").select("*", { count: "exact", head: true });
				setStatSpd(typeof r.count === "number" ? r.count : null);
			} catch { setStatSpd(null); }
			try {
				const r = await sb.from("bdr").select("*", { count: "exact", head: true }).eq("menolak_bdr", false).gt("jarak", 8);
				setStatBdr(typeof r.count === "number" ? r.count : null);
			} catch { setStatBdr(null); }
			try {
				const r = await sb.from("bdr").select("*", { count: "exact", head: true });
				setStatBdrTotal(typeof r.count === "number" ? r.count : null);
			} catch { setStatBdrTotal(null); }
			try {
				const r = await sb.from("profiles").select("*", { count: "exact", head: true });
				setStatJumlah(typeof r.count === "number" ? r.count : null);
			} catch { setStatJumlah(null); }
			try {
				const r = await sb.from("pengumuman").select("*").order("tarikh", { ascending: false }).limit(6);
				if (!r.error && r.data) setPengumuman(r.data as Pengumuman[]);
			} catch { /* ignore */ }
			try {
				const r = await sb.from("agenda").select("tarikh").limit(1000);
				if (!r.error && r.data) {
					const year = new Date().getFullYear();
					const months = new Array(12).fill(0) as number[];
					for (const row of r.data as Array<{ tarikh: string | null }>) {
						if (!row.tarikh) continue;
						const d = new Date(row.tarikh);
						if (!isNaN(d.getTime()) && d.getFullYear() === year) months[d.getMonth()] += 1;
					}
					setAgendaMonths(months);
				}
			} catch { setAgendaMonths(null); }
			try {
				const r = await sb.from("profiles").select("nama,tarikh_lahir").not("tarikh_lahir", "is", null);
				if (!r.error && r.data) {
					const mon = new Date().getMonth() + 1;
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
			} catch { /* ignore */ }
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fmt = (n: number | null) => (n == null ? "\u2014" : String(n));
	const today = new Date();
	const tarikhPenuh = today.toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

	const donutPct = statBdrTotal && statBdrTotal > 0 && statBdr != null ? Math.round((statBdr / statBdrTotal) * 100) : null;
	const CIRC = 2 * Math.PI * 52;
	const dashOffset = donutPct == null ? CIRC : CIRC - (CIRC * donutPct) / 100;
	const maxAgenda = agendaMonths ? Math.max(1, ...agendaMonths) : 1;

	const KPI = [
		{ label: "Staf Berdaftar", value: fmt(statJumlah), sub: "Profil aktif", Icon: IconUsers, chip: "chip-grad" },
		{ label: "Lembar SKT", value: fmt(statSpd), sub: "Semua kategori", Icon: IconActivity, chip: "bg-good-soft text-good" },
		{ label: "BDR Layak", value: fmt(statBdr), sub: "Jarak melebihi 8 km", Icon: IconClipboard, chip: "bg-warn-soft text-warn" },
		{ label: "Hari Lahir", value: String(birthdays.length), sub: "Bulan ini", Icon: IconGift, chip: "bg-risk-soft text-risk" },
	];

	return (
		<div className="mx-auto w-full max-w-[1240px] px-8 py-8">
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr,1fr]">
				<motion.div initial={fadeUpHidden} animate={fadeUpShow} transition={t0} className="hero-grad relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 text-white">
					<div>
						<span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white/90 backdrop-blur">
							<span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Sesi {today.getFullYear()} · Langsung
						</span>
						<h1 className="mt-3 text-[27px] font-extrabold leading-tight tracking-tight">Selamat kembali, {firstName} 👋</h1>
						<p className="mt-1 max-w-[420px] text-[13px] leading-relaxed text-white/65">{tarikhPenuh}. Semua statistik seksyen dikemas kini terus dari pangkalan data.</p>
					</div>
					<div className="mt-6 flex flex-wrap items-end justify-between gap-4">
						<div>
							<div className="text-[11px] font-bold uppercase tracking-wider text-white/55">Jumlah Lembar SKT</div>
							<div className="mt-1 flex items-baseline gap-2.5">
								<span className="text-[40px] font-extrabold leading-none tracking-[-0.03em]">{fmt(statSpd)}</span>
								<span className="rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[11.5px] font-bold text-emerald-300">Sesi ini</span>
							</div>
						</div>
						<button onClick={() => onOpenModule && onOpenModule("status-spd")} className="rounded-lg px-4 py-2.5 text-[13px] font-bold text-white backdrop-blur transition-colors hover:bg-white/20" style={heroBtn}>
							Buka Status SPD →
						</button>
					</div>
				</motion.div>
				<motion.div initial={fadeUpHidden} animate={fadeUpShow} transition={t1} className="grid grid-cols-2 gap-4">
					{KPI.map((k) => (
						<div key={k.label} className="glass-card flex flex-col justify-between rounded-2xl p-4">
							<div className="flex items-center justify-between gap-2">
								<span className="text-[10.5px] font-bold uppercase tracking-wider text-secondary">{k.label}</span>
								<span className={`flex h-8 w-8 items-center justify-center rounded-lg ${k.chip}`}><k.Icon className="h-4 w-4" /></span>
							</div>
							<div className="mt-2">
								<div className="text-[24px] font-extrabold leading-none tracking-[-0.02em] text-primary">{k.value}</div>
								<div className="mt-1 text-[11.5px] text-secondary">{k.sub}</div>
							</div>
						</div>
					))}
				</motion.div>
			</div>

			<div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr,1fr]">
				<motion.div initial={fadeUpHidden} animate={fadeUpShow} transition={t2} className="glass-card rounded-2xl p-5">
					<div className="flex items-center justify-between gap-2">
						<div>
							<h2 className="text-[15px] font-bold text-primary">Agenda Mengikut Bulan</h2>
							<p className="text-[11.5px] text-secondary">Taburan aktiviti tahun {today.getFullYear()}</p>
						</div>
						<span className="rounded-md bg-accent-soft px-2 py-1 text-[10.5px] font-bold uppercase tracking-wider text-accent">Auto</span>
					</div>
					{agendaMonths ? (
						<div className="mt-5 flex h-[150px] items-end gap-2">
							{agendaMonths.map((v, i) => {
								const hStyle = { height: `${Math.max(4, Math.round((v / maxAgenda) * 100))}%` };
								return (
									<div key={TK_MON[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
										{v > 0 && <span className="text-[10.5px] font-bold text-secondary">{v}</span>}
										<div className={`w-full max-w-[26px] rounded-t-md ${v > 0 ? "bar-grad" : "bar-dim"}`} style={hStyle} />
										<span className="text-[10px] font-semibold text-secondary">{TK_MON[i]}</span>
									</div>
								);
							})}
						</div>
					) : (
						<div className="mt-5 flex h-[150px] items-center justify-center text-[13.5px] text-secondary">Tiada data agenda dapat dimuatkan.</div>
					)}
				</motion.div>
				<motion.div initial={fadeUpHidden} animate={fadeUpShow} transition={t3} className="glass-card flex flex-col rounded-2xl p-5">
					<h2 className="text-[15px] font-bold text-primary">Liputan BDR</h2>
					<p className="text-[11.5px] text-secondary">Pegawai layak berbanding keseluruhan</p>
					<div className="flex flex-1 items-center justify-center gap-6 pt-3">
						<div className="relative h-[130px] w-[130px]">
							<svg viewBox="0 0 130 130" className="h-full w-full -rotate-90">
								<defs>
									<linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
										<stop offset="0%" stopColor="#4f5dff" />
										<stop offset="100%" stopColor="#22d3ee" />
									</linearGradient>
								</defs>
								<circle cx="65" cy="65" r="52" fill="none" strokeWidth="12" className="stroke-surface-2" />
								<circle cx="65" cy="65" r="52" fill="none" strokeWidth="12" strokeLinecap="round" stroke="url(#donutGrad)" strokeDasharray={CIRC} strokeDashoffset={dashOffset} />
							</svg>
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<span className="text-[26px] font-extrabold leading-none tracking-tight text-primary">{donutPct == null ? "\u2014" : `${donutPct}%`}</span>
								<span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-secondary">Layak</span>
							</div>
						</div>
						<div className="space-y-2.5">
							<div>
								<div className="text-[18px] font-extrabold leading-none text-primary">{fmt(statBdr)}</div>
								<div className="mt-0.5 text-[11px] text-secondary">Layak (&gt;8 km)</div>
							</div>
							<div>
								<div className="text-[18px] font-extrabold leading-none text-primary">{fmt(statBdrTotal)}</div>
								<div className="mt-0.5 text-[11px] text-secondary">Keseluruhan rekod</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>

			<div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr,1fr]">
				<motion.div initial={fadeUpHidden} animate={fadeUpShow} transition={t3} className="glass-card rounded-2xl p-5">
					<div className="flex items-center justify-between">
						<h2 className="text-[15px] font-bold text-primary">Aktiviti Terkini</h2>
						<IconBell className="h-4 w-4 text-secondary" />
					</div>
					{pengumuman.length === 0 ? (
						<p className="mt-4 text-[13.5px] text-secondary">Tiada pengumuman terkini.</p>
					) : (
						<div className="mt-3 space-y-1">
							{pengumuman.map((p, i) => (
								<div key={i} className="flex items-start gap-3 rounded-lg px-2 py-2">
									<span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-accent" style={glowDot} />
									<div className="min-w-0 flex-1">
										<div className="truncate text-[13px] font-semibold text-primary">{p.tajuk}</div>
										<div className="text-[11px] text-secondary">{formatTarikh(p.tarikh)}{p.jenis ? ` · ${p.jenis}` : ""}</div>
									</div>
								</div>
							))}
						</div>
					)}
				</motion.div>
				<motion.div initial={fadeUpHidden} animate={fadeUpShow} transition={t4} className="glass-card rounded-2xl p-5">
					<h2 className="text-[15px] font-bold text-primary">Hari Lahir Bulan Ini</h2>
					{birthdays.length === 0 ? (
						<p className="mt-4 text-[13.5px] text-secondary">Tiada hari lahir bulan ini.</p>
					) : (
						<div className="mt-3 space-y-2">
							{birthdays.slice(0, 6).map((b) => (
								<div key={b.nama} className="flex items-center gap-3">
									<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-risk-soft text-[14px]">🎂</span>
									<div className="min-w-0">
										<div className="truncate text-[13px] font-semibold text-primary">{b.nama}</div>
										<div className="text-[11px] text-secondary">{b.day} {TK_MON[b.month - 1]}</div>
									</div>
								</div>
							))}
						</div>
					)}
				</motion.div>
			</div>

			<motion.div initial={fadeUpHidden} animate={fadeUpShow} transition={t4} className="mt-7">
				<h2 className="mb-3 text-[15px] font-bold text-primary">Modul Utama</h2>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{MODULES.map((m) => (
						<button
							key={m.label}
							onClick={() => m.view && onOpenModule && onOpenModule(m.view)}
							className="glass-hover glass-card flex items-center gap-3 rounded-xl p-4 text-left"
						>
							<span className="chip-grad flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"><m.Icon className="h-4 w-4" /></span>
							<span className="min-w-0">
								<span className="block truncate text-[13.5px] font-bold text-primary">{m.label}</span>
								<span className="block truncate text-[11.5px] text-secondary">{m.desc}</span>
							</span>
						</button>
					))}
				</div>
			</motion.div>
		</div>
	);
}
