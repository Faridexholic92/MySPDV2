"use client";

import { useState } from "react";
import type { useAuth } from "@/hooks/useAuth";
import { IconX } from "@/components/icons";

export function ForgotPasswordModal({
	auth,
	prefillEmail,
	onClose,
}: {
	auth: ReturnType<typeof useAuth>;
	prefillEmail: string;
	onClose: () => void;
}) {
	const [email, setEmail] = useState(prefillEmail);
	const [busy, setBusy] = useState(false);
	const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

	async function sendReset() {
		if (!email.trim()) {
			setMsg({ text: "Sila isi email.", ok: false });
			return;
		}
		setBusy(true);
		setMsg({ text: "Memproses permintaan\u2026", ok: true });
		try {
			const { error } = await auth.sb.auth.resetPasswordForEmail(email.trim(), {
				redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
			});
			if (error) throw error;
			setMsg({ text: "\u2713 Pautan reset telah dihantar. Sila semak email anda.", ok: true });
			setTimeout(onClose, 2000);
		} catch (e) {
			const m = (e as Error)?.message || "";
			if (m.includes("User not found")) setMsg({ text: "Email tidak dijumpai dalam sistem.", ok: false });
			else setMsg({ text: "Gagal hantar reset: " + (m || "Unknown error"), ok: false });
		} finally {
			setBusy(false);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-sm rounded-lg border border-border bg-canvas p-6 shadow-card"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-sm font-bold">Lupa Kata Laluan</h2>
					<button onClick={onClose} className="text-secondary" aria-label="Tutup">
						<IconX className="h-4 w-4" />
					</button>
				</div>
				<label className="mb-1.5 block text-[12.5px] font-semibold">Email</label>
				<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
					placeholder="nama@jupem.gov.my"
					disabled={busy}
				/>
				{msg && (
					<div
						className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
							msg.ok ? "border-good/30 bg-good-soft text-good" : "border-risk/30 bg-risk-soft text-risk"
						}`}
					>
						{msg.text}
					</div>
				)}
				<div className="mt-5 flex justify-end gap-2">
					<button onClick={onClose} className="px-3 py-2 text-xs font-bold text-secondary">
						Batal
					</button>
					<button
						onClick={sendReset}
						disabled={busy}
						className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
					>
						{busy ? "Menghantar..." : "Hantar"}
					</button>
				</div>
			</div>
		</div>
	);
}
