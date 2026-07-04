"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useToasts } from "@/hooks/useToasts";
import { ToastContainer } from "@/components/ToastContainer";
import { ProfileModal } from "@/components/ProfileModal";
import { Sidebar, type ViewKey } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { DashboardView } from "@/components/DashboardView";
import { StatusSpdView } from "@/components/StatusSpdView";
import { StatusBdrView } from "@/components/StatusBdrView";
import { StatusOperasiView } from "@/components/StatusOperasiView";
import { StatusKursusView } from "@/components/StatusKursusView";
import { Borang4JamView } from "@/components/Borang4JamView";
import { AgendaView } from "@/components/AgendaView";
import { DokumenRasmiView, EksaView, PerayaanView } from "@/components/LinkHubView";
import { AdminView } from "@/components/AdminView";
import type { AuthedUser } from "@/lib/types";

const VIEW_TITLES: Partial<Record<ViewKey, { crumb: string; active: string }>> = {
	admin: { crumb: "Pentadbiran", active: "Pengurusan Pengguna" },
	"status-spd": { crumb: "Operasi", active: "Status Semasa SPD" },
	"status-bdr": { crumb: "Operasi", active: "Status BDR" },
	"status-operasi": { crumb: "Operasi", active: "Status Operasi" },
	"status-kursus": { crumb: "Jadual", active: "Status Kursus" },
	"borang-4jam": { crumb: "Dokumen", active: "Borang 4 Jam" },
	agenda: { crumb: "Jadual", active: "Agenda MySPD" },
	dokumen: { crumb: "Dokumen", active: "Dokumen Rasmi" },
	eksa: { crumb: "Kualiti & Komuniti", active: "EKSA MySPD" },
	perayaan: { crumb: "Kualiti & Komuniti", active: "Perayaan" },
};

const viewInitial = { opacity: 0, y: 8 };
const viewAnimate = { opacity: 1, y: 0 };
const viewExit = { opacity: 0, y: -8 };
const viewTransition = { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const };

export function PortalShell({ auth, user }: { auth: ReturnType<typeof useAuth>; user: AuthedUser }) {
	const { theme, toggleTheme } = useTheme();
	const { toasts, showToast } = useToasts();
	const [profileOpen, setProfileOpen] = useState(false);
	const [view, setView] = useState<ViewKey>("dashboard");

	// Superadmin-only view guard is client-side UI convenience only; see the
	// security note at the top of AdminView.tsx for what this does NOT protect.
	const effectiveView: ViewKey = view === "admin" && user.role !== "superadmin" ? "dashboard" : view;

	return (
		<div className="flex min-h-screen bg-surface">
			<Sidebar user={user} view={effectiveView} onNavigate={setView} />

			<div className="flex min-w-0 flex-1 flex-col">
				<Topbar
					user={user}
					auth={auth}
					theme={theme}
					onToggleTheme={toggleTheme}
					onOpenProfile={() => setProfileOpen(true)}
					title={VIEW_TITLES[effectiveView]}
				/>

				<AnimatePresence mode="wait">
					<motion.div key={effectiveView} initial={viewInitial} animate={viewAnimate} exit={viewExit} transition={viewTransition}>
						{effectiveView === "admin" ? (
							<AdminView auth={auth} showToast={showToast} />
						) : effectiveView === "status-spd" ? (
							<StatusSpdView auth={auth} />
						) : effectiveView === "status-bdr" ? (
							<StatusBdrView auth={auth} />
						) : effectiveView === "status-operasi" ? (
							<StatusOperasiView auth={auth} />
						) : effectiveView === "status-kursus" ? (
							<StatusKursusView auth={auth} />
						) : effectiveView === "borang-4jam" ? (
							<Borang4JamView auth={auth} />
						) : effectiveView === "agenda" ? (
							<AgendaView auth={auth} />
						) : effectiveView === "dokumen" ? (
							<DokumenRasmiView />
						) : effectiveView === "eksa" ? (
							<EksaView />
						) : effectiveView === "perayaan" ? (
							<PerayaanView />
						) : (
							<DashboardView user={user} auth={auth} onOpenModule={setView} />
						)}
					</motion.div>
				</AnimatePresence>
			</div>

			<AnimatePresence>
				{profileOpen && (
					<ProfileModal auth={auth} user={user} onClose={() => setProfileOpen(false)} showToast={showToast} />
				)}
			</AnimatePresence>

			<ToastContainer toasts={toasts} />
		</div>
	);
}
