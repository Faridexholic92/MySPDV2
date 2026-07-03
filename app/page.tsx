"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoginScreen } from "@/components/LoginScreen";
import { NewPasswordModal } from "@/components/NewPasswordModal";
import { PortalShell } from "@/components/PortalShell";

export default function HomePage() {
	const auth = useAuth();

	if (auth.status === "loading") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-surface text-sm text-secondary">
				Memuatkan\u2026
			</div>
		);
	}

	if (auth.status === "passwordRecovery") {
		return <NewPasswordModal auth={auth} onDone={() => window.location.reload()} />;
	}

	if (auth.status === "loggedIn" && auth.user) {
		return <PortalShell auth={auth} user={auth.user} />;
	}

	return <LoginScreen auth={auth} />;
}
