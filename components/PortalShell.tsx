"use client";

import { useState } from "react";
import type { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useToasts } from "@/hooks/useToasts";
import { ToastContainer } from "@/components/ToastContainer";
import { ProfileModal } from "@/components/ProfileModal";
import { Sidebar, type ViewKey } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { DashboardView } from "@/components/DashboardView";
import { AdminView } from "@/components/AdminView";
import type { AuthedUser } from "@/lib/types";

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
					title={effectiveView === "admin" ? "Panel Admin" : undefined}
				/>

				{effectiveView === "admin" ? (
					<AdminView auth={auth} showToast={showToast} />
				) : (
					<DashboardView user={user} />
				)}
			</div>

			{profileOpen && (
				<ProfileModal auth={auth} user={user} onClose={() => setProfileOpen(false)} showToast={showToast} />
			)}

			<ToastContainer toasts={toasts} />
		</div>
	);
}
