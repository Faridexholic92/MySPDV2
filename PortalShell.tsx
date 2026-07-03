"use client";

import type { AuthedUser } from "@/lib/types";
import {
	IconFile,
	IconCalendar,
	IconActivity,
	IconGraduation,
	IconCheckCircle,
	IconEdit,
	IconUsers,
} from "@/components/icons";

const STATS = [
	{ label: "Dokumen Rasmi", value: "128", trend: "+4", Icon: IconFile, tone: "accent" as const },
	{ label: "Mesyuarat Minggu Ini", value: "3", Icon: IconCalendar, tone: "good" as const },
	{ label: "Borang Belum Lengkap", value: "5", Icon: IconEdit, tone: "warn" as const },
	{ label: "Staf Berdaftar", value: "19", Icon: IconUsers, tone: "neutral" as const },
];

const MODULES = [
	{ label: "Portal Dokumen Rasmi", desc: "Akses SOP, manual kerja dan minit mesyuarat seksyen.", Icon: IconFile },
	{ label: "Agenda MySPD", desc: "Jadual dan agenda mesyuarat akan datang.", Icon: IconCalendar },
	{ label: "Status Operasi", desc: "Pantau prestasi dan status operasi harian.", Icon: IconActivity },
	{ label: "Status Kursus", desc: "Rekod dan status kursus latihan staf.", Icon: IconGraduation },
	{ label: "EKSA MySPD", desc: "Polisi, objektif dan galeri aktiviti EKSA.", Icon: IconCheckCircle },
	{ label: "Borang 4 Jam", desc: "Hantar dan jejak borang tugasan 4 jam.", Icon: IconEdit },
];

const ANNOUNCEMENTS = [
	{ dot: "bg-accent", title: "SOP baharu dimuat naik", meta: "SOP Operasi Lapangan v3 \u00b7 2 jam lalu" },
	{ dot: "bg-good", title: "Minit mesyuarat Jun disiarkan", meta: "Minit Mesyuarat Seksyen \u00b7 semalam" },
	{ dot: "bg-warn", title: "Peringatan: borang 4 jam", meta: "5 staf belum hantar borang bulan ini" },
];

const toneClasses: Record<string, string> = {
	accent: "bg-accent-soft text-accent",
	good: "bg-good-soft text-good",
	warn: "bg-warn-soft text-warn",
	neutral: "bg-surface-2 text-secondary",
};

export function DashboardView({ user }: { user: AuthedUser }) {
	const firstName = (user.name || "").split(" ")[0] || user.name;

	return (
		<div className="mx-auto max-w-[1120px] px-7 py-8">
			<h1 className="mb-1 text-[22px] font-extrabold tracking-tight">Selamat kembali, {firstName}.</h1>
			<p className="mb-7 text-[13.5px] text-secondary">Berikut ringkasan aktiviti seksyen anda hari ini.</p>

			<div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
				{STATS.map((s) => (
					<div key={s.label} className="rounded-lg border border-border bg-canvas p-4.5">
						<div className="mb-3.5 flex items-center justify-between">
							<div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClasses[s.tone]}`}>
								<s.Icon className="h-4 w-4" />
							</div>
							{s.trend && (
								<span className="rounded-full bg-good-soft px-1.5 py-0.5 text-[11px] font-bold text-good">
									{s.trend}
								</span>
							)}
						</div>
						<b className="block text-2xl font-extrabold">{s.value}</b>
						<span className="text-xs text-secondary">{s.label}</span>
					</div>
				))}
			</div>

			<div className="mb-3.5 flex items-center justify-between">
				<h2 className="text-[14.5px] font-extrabold">Modul Portal</h2>
			</div>
			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{MODULES.map((m) => (
					<div
						key={m.label}
						className="rounded-lg border border-border bg-canvas p-4.5 transition hover:-translate-y-0.5 hover:shadow-card"
					>
						<div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
							<m.Icon className="h-[18px] w-[18px]" />
						</div>
						<h3 className="mb-1 text-[13.5px] font-bold">{m.label}</h3>
						<p className="text-xs leading-relaxed text-secondary">{m.desc}</p>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
				<div className="rounded-lg border border-border bg-canvas p-4.5">
					<div className="mb-3 flex items-center justify-between">
						<h2 className="text-[14.5px] font-extrabold">Pengumuman Terkini</h2>
					</div>
					{ANNOUNCEMENTS.map((a, i) => (
						<div
							key={i}
							className={`flex gap-3 py-2.5 ${i < ANNOUNCEMENTS.length - 1 ? "border-b border-border" : ""}`}
						>
							<span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.dot}`} />
							<div>
								<b className="block text-[13px] font-bold">{a.title}</b>
								<span className="text-[11.5px] text-secondary">{a.meta}</span>
							</div>
						</div>
					))}
				</div>

				<div className="rounded-lg border border-border bg-canvas p-4.5">
					<h2 className="mb-3 text-[14.5px] font-extrabold">Staf Dalam Talian</h2>
					{[
						["Nurul Ain", "Penolong Pegawai"],
						["Khairul Hafiz", "Juruukur"],
						["Siti Maisarah", "Kerani"],
					].map(([name, role], i, arr) => (
						<div key={name} className={`flex items-center gap-2.5 py-2.5 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
							<div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-[10.5px] font-bold text-secondary">
								{name
									.split(" ")
									.map((s) => s[0])
									.slice(0, 2)
									.join("")}
							</div>
							<div>
								<b className="block text-[13px] font-bold">{name}</b>
								<span className="text-[11.5px] text-secondary">{role}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
