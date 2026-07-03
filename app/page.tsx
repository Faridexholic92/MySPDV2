"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoginScreen } from "@/components/LoginScreen";
import { NewPasswordModal } from "@/components/NewPasswordModal";
import { PortalShell } from "@/components/PortalShell";
import { LogoMark } from "@/components/icons";

const whiteStrokeStyle: React.CSSProperties = { stroke: "#fff" };

function SplashScreen() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
			<div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-ink">
				<LogoMark className="h-5 w-5" style={whiteStrokeStyle} />
			</div>
			<p className="text-sm font-semibold text-secondary">Memuatkan Portal MySPD\u2026</p>
		</div>
	);
}

export default function HomePage() {
	const auth = useAuth();

	if (auth.status === "loading") return <SplashScreen />;
	if (auth.status === "passwordRecovery") {
		return <NewPasswordModal auth={auth} onDone={() => window.location.reload()} />;
	}
	if (auth.status === "loggedIn" && auth.user) return <PortalShell auth={auth} user={auth.user} />;
	return <LoginScreen auth={auth} />;
}
