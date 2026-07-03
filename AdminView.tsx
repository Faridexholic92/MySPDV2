"use client";

import {
	LogoMark,
	IconGrid,
	IconFile,
	IconCalendar,
	IconActivity,
	IconGraduation,
	IconCheckCircle,
	IconEdit,
	IconShield,
} from "@/components/icons";
import type { AuthedUser } from "@/lib/types";

export type ViewKey = "dashboard" | "admin";

const whiteStrokeStyle: React.CSSProperties = { stroke: "#fff" };

const MAIN_NAV: Array<{ key: ViewKey; label: string; Icon: typeof IconGrid; disabled?: boolean }> = [
	{ key: "dashboard", label: "Dashboard", Icon: IconGrid },
];

const MODULE_NAV = [
	{ label: "Dokumen Rasmi", Icon: IconFile },
	{ label: "Agenda", Icon: IconCalendar },
	{ label: "Status Operasi", Icon: IconActivity },
	{ label: "Status Kursus", Icon: IconGraduation },
	{ label: "EKSA", Icon: IconCheckCircle },
	{ label: "Borang 4 Jam", Icon: IconEdit },
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
		<aside className="flex w-[248px] shrink-0 flex-col border-r border-border bg-canvas p-3.5">
			<div className="flex items-center gap-2.5 px-2 pb-5 pt-1.5">
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent">
					<LogoMark className="h-[17px] w-[17px]" style={whiteStrokeStyle} />
				</div>
				<div>
					<b className="block text-[13.5px] font-extrabold">MySPD</b>
					<span className="text-[11px] text-secondary">JUPEM</span>
				</div>
			</div>

			<div className="px-2.5 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-wider text-secondary">
				Menu Utama
			</div>
			{MAIN_NAV.map(({ key, label, Icon }) => (
				<button
					key={key}
					onClick={() => onNavigate(key)}
					className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-semibold ${
						view === key ? "bg-accent-soft text-accent" : "text-primary hover:bg-surface-2"
					}`}
				>
					<Icon className={`h-[17px] w-[17px] ${view === key ? "text-accent" : "text-secondary"}`} />
					{label}
				</button>
			))}
			{MODULE_NAV.map(({ label, Icon }) => (
				<button
					key={label}
					title="Modul ini belum dibina dalam remake teras ini"
					className="mb-0.5 flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-semibold text-primary/50"
				>
					<Icon className="h-[17px] w-[17px] text-secondary/60" />
					{label}
				</button>
			))}

			{isSuperAdmin && (
				<>
					<div className="px-2.5 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-wider text-secondary">
						Pentadbiran
					</div>
					<button
						onClick={() => onNavigate("admin")}
						className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-semibold ${
							view === "admin" ? "bg-accent-soft text-accent" : "text-primary hover:bg-surface-2"
						}`}
					>
						<IconShield className={`h-[17px] w-[17px] ${view === "admin" ? "text-accent" : "text-secondary"}`} />
						Panel Admin
					</button>
				</>
			)}

			<div className="mt-auto flex items-center gap-2.5 border-t border-border pt-3.5">
				<div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-secondary">
					{initials}
				</div>
				<div className="min-w-0">
					<b className="block truncate text-[12.5px] font-bold">{user.name}</b>
					<span className="text-[11px] text-secondary">{isSuperAdmin ? "Superadmin" : "Staf"}</span>
				</div>
			</div>
		</aside>
	);
}
