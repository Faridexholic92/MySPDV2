"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import { LogoMark } from "@/components/icons";

const MIN_PASSWORD_LENGTH = 8;
const whiteStrokeStyle: React.CSSProperties = { stroke: "#fff" };
const cardInitial = { opacity: 0, scale: 0.96, y: 12 };
const cardAnimate = { opacity: 1, scale: 1, y: 0 };
const cardTransition = { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const };

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
			}, 1800);
		} catch (e) {
			setMsg({ text: "Gagal: " + ((e as Error)?.message || "Cuba lagi."), ok: false });
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-surface px-4">
			<motion.div
				initial={cardInitial}
				animate={cardAnimate}
				transition={cardTransition}
				className="w-full max-w-sm rounded-2xl glass-card p-8 shadow-card"
			>
				<div className="mb-6 flex items-center gap-2.5">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink">
						<LogoMark className="h-[18px] w-[18px]" style={whiteStrokeStyle} />
					</div>
					<div className="text-[15px] font-extrabold tracking-tight">PORTAL MySPD</div>
				</div>
				<h2 className="mb-4 text-sm font-extrabold">Tetapkan Kata Laluan Baharu</h2>
				<div className="space-y-3">
					<input
						type="password"
						placeholder="Kata laluan baharu"
						value={p1}
						onChange={(e) => setP1(e.target.value)}
						className="w-full rounded-[9px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-[3.5px] focus:ring-accent-soft"
					/>
					<input
						type="password"
						placeholder="Sahkan kata laluan"
						value={p2}
						onChange={(e) => setP2(e.target.value)}
						className="w-full rounded-[9px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-[3.5px] focus:ring-accent-soft"
					/>
				</div>
				{msg && (
					<div
						className={`mt-3 rounded-[9px] border px-3 py-2 text-xs ${
							msg.ok ? "border-good/30 bg-good-soft text-good" : "border-risk/30 bg-risk-soft text-risk"
						}`}
					>
						{msg.text}
					</div>
				)}
				<button
					onClick={submit}
					disabled={busy}
					className="mt-5 min-h-[42px] w-full rounded-[9px] bg-ink text-[13.5px] font-bold text-white disabled:opacity-60"
				>
					{busy ? "Menyimpan..." : "Simpan Kata Laluan"}
				</button>
			</motion.div>
		</div>
	);
}
