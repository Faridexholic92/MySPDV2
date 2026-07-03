"use client";

import {
	LogoMark,
	IconGrid,
	IconFile,
	IconCalendar,
	IconCheckCircle,
	IconGraduation,
	IconGift,
	IconClipboard,
	IconClock,
	IconSatellite,
	IconActivity,
	IconShield,
} from "@/components/icons";
import type { AuthedUser } from "@/lib/types";

export type ViewKey = "dashboard" | "admin";

const whiteStrokeStyle: React.CSSProperties = { stroke: "#fff" };

// Modul sebenar diambil dari grid "Modul Utama" portal asal (index.html).
const MODULE_NAV = [
	{ label: "Status Semasa SPD", Icon: IconActivity },
	{ label: "Dokumen Rasmi", Icon: IconFile },
	{ label: "Agenda MySPD", Icon: IconCalendar },
	{ label: "EKSA MySPD", Icon: IconCheckCircle },
	{ label: "Perayaan", Icon: IconGift },
	{ label: "Status Kursus", Icon: IconGraduation },
	{ label: "Status BDR", Icon: IconClipboard },
	{ label: "Borang 4 Jam", Icon: IconClock },
	{ label: "Status Operasi", Icon: IconSatellite },
];

export function Sidebar({
	user,
	view,
	onNavigate,
}: {
	user: AuthedUser;
	view: ViewKey;
	onNavigate: (v: ViewKey) => void;
}) {
	const isSuperAdmin = user.role === "superadmin";
	const initials = (user.name || "U")
		.split(" ")
		.map((s) => s[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<aside className="flex w-[236px] shrink-0 flex-col overflow-y-auto bg-ink p-3">
			<div className="flex items-center gap-2.5 px-2 pb-5 pt-2">
				<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent">
					<LogoMark className="h-[15px] w-[15px]" style={whiteStrokeStyle} />
				</div>
				<div>
					<b className="block text-[13px] font-extrabold text-white">MySPD</b>
					<span className="text-[10.5px] text-white/40">JUPEM</span>
				</div>
			</div>

			<div className="px-2.5 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-wider text-white/35">
				Menu Utama
			</div>
			<button
				onClick={() => onNavigate("dashboard")}
				className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg border-l-2 px-2.5 py-2 text-left text-[13px] font-semibold ${
					view === "dashboard"
						? "border-accent bg-accent/[0.14] text-white"
						: "border-transparent text-white/75 hover:bg-white/[0.04]"
				}`}
			>
				<IconGrid className={`h-4 w-4 ${view === "dashboard" ? "text-accent-2" : "text-white/50"}`} />
				Dashboard
			</button>

			<div className="px-2.5 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-wider text-white/35">
				Modul Utama
			</div>
			{MODULE_NAV.map(({ label, Icon }) => (
				<button
					key={label}
					title="Modul ini belum dibina dalam remake teras ini"
					className="mb-0.5 flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg border-l-2 border-transparent px-2.5 py-2 text-left text-[13px] font-semibold text-white/30"
				>
					<Icon className="h-4 w-4 text-white/25" />
					{label}
				</button>
			))}

			{isSuperAdmin && (
				<>
					<div className="px-2.5 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-wider text-white/35">
						Pentadbiran
					</div>
					<button
						onClick={() => onNavigate("admin")}
						className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg border-l-2 px-2.5 py-2 text-left text-[13px] font-semibold ${
							view === "admin"
								? "border-accent bg-accent/[0.14] text-white"
								: "border-transparent text-white/75 hover:bg-white/[0.04]"
						}`}
					>
						<IconShield className={`h-4 w-4 ${view === "admin" ? "text-accent-2" : "text-white/50"}`} />
						Panel Admin
					</button>
				</>
			)}

			<div className="mt-auto flex items-center gap-2.5 border-t border-white/[0.08] pt-3.5">
				<div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
					{initials}
				</div>
				<div className="min-w-0">
					<b className="block truncate text-xs font-bold text-white">{user.name}</b>
					<span className="text-[10.5px] text-white/40">{isSuperAdmin ? "Superadmin" : "Staf"}</span>
				</div>
			</div>
		</aside>
	);
}
