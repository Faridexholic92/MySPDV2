"use client";

import { useState } from "react";
import type { useAuth } from "@/hooks/useAuth";
import { LogoMark } from "@/components/icons";

// Password minimum raised to 8 chars (was 6 in the legacy portal) to match
// the sign-up policy and close the inconsistency flagged in the security review.
const MIN_PASSWORD_LENGTH = 8;
const whiteStrokeStyle: React.CSSProperties = { stroke: "#fff" };

export function NewPasswordModal({
	auth,
	onDone,
}: {
	auth: ReturnType<typeof useAuth>;
	onDone: () => void;
}) {
	const [p1, setP1] = useState("");
	const [p2, setP2] = useState("");
	const [busy, setBusy] = useState(false);
	const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

	async function submit() {
		if (!p1 || p1.length < MIN_PASSWORD_LENGTH) {
			setMsg({ text: `Kata laluan mestilah ${MIN_PASSWORD_LENGTH} aksara ke atas.`, ok: false });
			return;
		}
		if (p1 !== p2) {
			setMsg({ text: "Kata laluan tidak sepadan. Cuba semula.", ok: false });
			return;
		}
		setBusy(true);
		try {
			const { error } = await auth.sb.auth.updateUser({ password: p1 });
			if (error) throw error;
			setMsg({ text: "\u2705 Kata laluan berjaya ditukar! Sila log masuk semula...", ok: true });
			setTimeout(async () => {
				await auth.logout();
				onDone();
			}, 2000);
		} catch (e) {
			setMsg({ text: "Gagal: " + ((e as Error)?.message || "Cuba lagi."), ok: false });
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-surface px-4">
			<div className="w-full max-w-sm rounded-lg border border-border bg-canvas p-8 shadow-card">
				<div className="mb-6 flex items-center gap-2.5">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-accent">
						<LogoMark className="h-[18px] w-[18px]" style={whiteStrokeStyle} />
					</div>
					<div className="text-[15px] font-extrabold tracking-wide">PORTAL MySPD</div>
				</div>
				<h2 className="mb-4 text-sm font-bold">Tetapkan Kata Laluan Baharu</h2>
				<div className="space-y-3">
					<input
						type="password"
						placeholder="Kata laluan baharu"
						value={p1}
						onChange={(e) => setP1(e.target.value)}
						className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
					/>
					<input
						type="password"
						placeholder="Sahkan kata laluan"
						value={p2}
						onChange={(e) => setP2(e.target.value)}
						className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
					/>
				</div>
				{msg && (
					<div
						className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
							msg.ok ? "border-good/30 bg-good-soft text-good" : "border-risk/30 bg-risk-soft text-risk"
						}`}
					>
						{msg.text}
					</div>
				)}
				<button
					onClick={submit}
					disabled={busy}
					className="mt-5 min-h-[44px] w-full rounded-lg bg-accent text-sm font-bold text-white disabled:opacity-60"
				>
					{busy ? "Menyimpan..." : "Simpan Kata Laluan"}
				</button>
			</div>
		</div>
	);
}
