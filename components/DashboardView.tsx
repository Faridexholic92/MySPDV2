"use client";

import { motion } from "framer-motion";
import type { AuthedUser } from "@/lib/types";
import { IconFile, IconCalendar, IconActivity } from "@/components/icons";

const STATS = [
	{ label: "Dokumen Rasmi", value: "128", trend: "+4.2%", spark: "0,20 15,18 30,22 45,12 60,15 75,6 90,9 100,4", color: "#12A579" },
	{ label: "Mesyuarat Minggu Ini", value: "3", trend: "+1", spark: "0,10 15,14 30,8 45,16 60,10 75,18 90,12 100,15", color: "#4F5DFF" },
	{ label: "Borang Belum Lengkap", value: "5", trend: null, spark: "0,6 15,10 30,8 45,14 60,18 75,15 90,20 100,18", color: "#C87A0F" },
	{ label: "Staf Berdaftar", value: "19", trend: null, spark: "0,15 15,15 30,12 45,12 60,10 75,10 90,8 100,8", color: "#6B6D76" },
];

const BARS = [
	{ day: "Isn", h: 58 },
	{ day: "Sel", h: 72 },
	{ day: "Rab", h: 44 },
	{ day: "Kha", h: 92, hi: true },
	{ day: "Jum", h: 66 },
	{ day: "Sab", h: 20 },
	{ day: "Ahd", h: 12 },
];

const MODULES = [
	{ label: "Dokumen Rasmi", desc: "SOP & manual kerja", Icon: IconFile },
	{ label: "Agenda", desc: "Mesyuarat akan datang", Icon: IconCalendar },
	{ label: "Status Operasi", desc: "Prestasi harian", Icon: IconActivity },
];

const ANNOUNCEMENTS = [
	{ title: "SOP baharu dimuat naik", meta: "2 jam lalu" },
	{ title: "Minit mesyuarat Jun disiarkan", meta: "Semalam" },
	{ title: "5 staf belum hantar borang", meta: "2 hari lalu" },
];

const fadeUpHidden = { opacity: 0, y: 14 };
const fadeUpShow = { opacity: 1, y: 0 };
const easeCurve = [0.16, 1, 0.3, 1] as const;

function useDelay(seconds: number) {
	return { duration: 0.4, delay: seconds, ease: easeCurve };
}

const barInitial = { height: "0%" };
function useBarTransition(seconds: number) {
	return { duration: 0.6, delay: seconds, ease: easeCurve };
}

export function DashboardView({ user }: { user: AuthedUser }) {
	const firstName = (user.name || "").split(" ")[0] || user.name;

	return (
		<div className="mx-auto max-w-[1180px] px-7 py-7">
			<motion.div
				initial={fadeUpHidden}
				animate={fadeUpShow}
				transition={useDelay(0)}
				className="mb-5"
			>
				<h1 className="mb-0.5 text-[21px] font-extrabold tracking-tight">Selamat kembali, {firstName}.</h1>
				<p className="text-[12.5px] text-secondary">Jumaat, 3 Julai 2026</p>
			</motion.div>

			<div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
				{STATS.map((s, i) => (
					<motion.div
						key={s.label}
						initial={fadeUpHidden}
						animate={fadeUpShow}
						transition={useDelay(0.06 + i * 0.05)}
						className="rounded-lg border border-border bg-canvas p-4 shadow-sm"
					>
						<div className="mb-1.5 flex items-center justify-between">
							<span className="text-[11.5px] font-semibold text-secondary">{s.label}</span>
							{s.trend && (
								<span className="rounded-full bg-good-soft px-1.5 py-0.5 text-[10.5px] font-extrabold text-good">
									{s.trend}
								</span>
							)}
						</div>
						<b className="mb-2 block text-[23px] font-extrabold tracking-tight">{s.value}</b>
						<svg width="100%" height="28" viewBox="0 0 100 28" preserveAspectRatio="none">
							<polyline points={s.spark} fill="none" stroke={s.color} strokeWidth="2" />
						</svg>
					</motion.div>
				))}
			</div>

			<div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
				<motion.div
					initial={fadeUpHidden}
					animate={fadeUpShow}
					transition={useDelay(0.3)}
					className="rounded-lg border border-border bg-canvas p-5 shadow-sm"
				>
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-[13.5px] font-extrabold">Aktiviti Dokumen (7 Hari)</h2>
						<div className="flex gap-1 rounded-lg bg-surface p-1">
							<span className="rounded-md bg-canvas px-2.5 py-1 text-[11px] font-bold shadow-sm">Minggu</span>
							<span className="px-2.5 py-1 text-[11px] font-bold text-secondary">Bulan</span>
						</div>
					</div>
					<div className="flex h-[150px] items-stretch gap-2.5 px-1">
						{BARS.map((b, i) => (
							<div key={b.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
								<motion.div
									initial={barInitial}
									animate={{ height: `${b.h}%` }}
									transition={useBarTransition(0.35 + i * 0.05)}
									className={`w-full rounded-t-[5px] rounded-b-[2px] ${b.hi ? "bg-accent" : "bg-accent-soft"}`}
								/>
								<span className="text-[10px] font-semibold text-secondary">{b.day}</span>
							</div>
						))}
					</div>
				</motion.div>

				<motion.div
					initial={fadeUpHidden}
					animate={fadeUpShow}
					transition={useDelay(0.35)}
					className="rounded-lg border border-border bg-canvas p-5 shadow-sm"
				>
					<h2 className="mb-3 text-[13.5px] font-extrabold">Pengumuman Terkini</h2>
					{ANNOUNCEMENTS.map((a, i) => (
						<div
							key={i}
							className={`py-2.5 ${i < ANNOUNCEMENTS.length - 1 ? "border-b border-border" : ""}`}
						>
							<b className="block text-[12.5px] font-bold">{a.title}</b>
							<span className="text-[11px] text-secondary">{a.meta}</span>
						</div>
					))}
				</motion.div>
			</div>

			<motion.h2
				initial={fadeUpHidden}
				animate={fadeUpShow}
				transition={useDelay(0.4)}
				className="mb-3 text-[13.5px] font-extrabold"
			>
				Modul Portal
			</motion.h2>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{MODULES.map((m, i) => (
					<motion.div
						key={m.label}
						initial={fadeUpHidden}
						animate={fadeUpShow}
						transition={useDelay(0.44 + i * 0.04)}
						className="flex items-center gap-3 rounded-lg border border-border bg-canvas p-3.5 shadow-sm"
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
		</div>
	);
}
