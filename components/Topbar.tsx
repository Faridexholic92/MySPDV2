"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import type { AuthedUser } from "@/lib/types";
import { IconSearch, IconBell, IconSun, IconMoon, IconLogOut, IconChevronDown } from "@/components/icons";

const menuInitial = { opacity: 0, scale: 0.96, y: -6 };
const menuAnimate = { opacity: 1, scale: 1, y: 0 };
const menuTransition = { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const };

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
	title?: { crumb: string; active: string };
}) {
	const [menuOpen, setMenuOpen] = useState(false);
	const initials = (user.name || "U")
		.split(" ")
		.map((s) => s[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div className="flex h-14 items-center justify-between glass-topbar px-7">
			{title ? (
				<div className="text-[12.5px] font-semibold text-secondary">
					{title.crumb} / <b className="font-bold text-primary">{title.active}</b>
				</div>
			) : (
				<div className="flex w-[280px] items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] text-secondary">
					<IconSearch className="h-3.5 w-3.5" />
					Cari dokumen, SOP, staf&hellip;
				</div>
			)}

			<div className="flex items-center gap-2.5">
				<button
					aria-label="Notifikasi"
					className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border text-secondary"
				>
					<IconBell className="h-4 w-4" />
					<span className="absolute right-[6px] top-[6px] h-1.5 w-1.5 rounded-full bg-risk" />
				</button>
				<button
					aria-label="Tukar tema"
					onClick={onToggleTheme}
					className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-secondary"
				>
					{theme === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
				</button>

				<div className="relative">
					<button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-1.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-[11px] font-bold text-secondary">
							{initials}
						</div>
						<IconChevronDown className="h-3.5 w-3.5 text-secondary" />
					</button>
					<AnimatePresence>
						{menuOpen && (
							<>
								<div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
								<motion.div
									initial={menuInitial}
									animate={menuAnimate}
									exit={menuInitial}
									transition={menuTransition}
									className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 rounded-xl glass-card p-1.5 shadow-card"
								>
									<div className="px-2.5 py-2 text-xs text-secondary">
										Log masuk sebagai
										<div className="truncate font-semibold text-primary">{user.email}</div>
									</div>
									<button
										onClick={() => {
											setMenuOpen(false);
											onOpenProfile();
										}}
										className="w-full rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold hover:bg-surface"
									>
										Sunting Profil
									</button>
									<button
										onClick={() => auth.logout()}
										className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-risk hover:bg-risk-soft"
									>
										<IconLogOut className="h-4 w-4" />
										Log Keluar
									</button>
								</motion.div>
							</>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
