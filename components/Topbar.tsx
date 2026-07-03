"use client";

import { useState } from "react";
import type { useAuth } from "@/hooks/useAuth";
import type { AuthedUser } from "@/lib/types";
import { IconSearch, IconBell, IconSun, IconMoon, IconChevronDown, IconLogOut } from "@/components/icons";

export function Topbar({
	user,
	auth,
	theme,
	onToggleTheme,
	onOpenProfile,
	title,
}: {
	user: AuthedUser;
	auth: ReturnType<typeof useAuth>;
	theme: "dark" | "light";
	onToggleTheme: () => void;
	onOpenProfile: () => void;
	title?: string;
}) {
	const [menuOpen, setMenuOpen] = useState(false);
	const initials = (user.name || "U")
		.split(" ")
		.map((s) => s[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-border bg-canvas px-7">
			{title ? (
				<div className="text-sm font-bold">{title}</div>
			) : (
				<div className="flex w-[280px] items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-secondary">
					<IconSearch className="h-[15px] w-[15px]" />
					Cari dokumen, SOP, staf&hellip;
				</div>
			)}

			<div className="flex items-center gap-3.5">
				<button
					aria-label="Notifikasi"
					className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border text-secondary"
				>
					<IconBell className="h-[17px] w-[17px]" />
					<span className="absolute right-[7px] top-[6px] h-1.5 w-1.5 rounded-full bg-risk" />
				</button>
				<button
					aria-label="Tukar tema"
					onClick={onToggleTheme}
					className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border text-secondary"
				>
					{theme === "dark" ? <IconSun className="h-[17px] w-[17px]" /> : <IconMoon className="h-[17px] w-[17px]" />}
				</button>

				<div className="relative border-l border-border pl-3.5">
					<button
						onClick={() => setMenuOpen((v) => !v)}
						className="flex items-center gap-2"
					>
						<div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface-2 text-[11px] font-bold text-secondary">
							{initials}
						</div>
						<IconChevronDown className="h-3.5 w-3.5 text-secondary" />
					</button>
					{menuOpen && (
						<>
							<div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
							<div className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 rounded-lg border border-border bg-canvas p-1.5 shadow-card">
								<div className="px-2.5 py-2 text-xs text-secondary">
									Log masuk sebagai <br />
									<span className="font-semibold text-primary">{user.email}</span>
								</div>
								<button
									onClick={() => {
										setMenuOpen(false);
										onOpenProfile();
									}}
									className="w-full rounded-md px-2.5 py-2 text-left text-[13px] font-semibold hover:bg-surface"
								>
									Sunting Profil
								</button>
								<button
									onClick={() => auth.logout()}
									className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-semibold text-risk hover:bg-risk-soft"
								>
									<IconLogOut className="h-4 w-4" />
									Log Keluar
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
