"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import { LogoMark, IconEye, IconEyeOff, IconAlertCircle } from "@/components/icons";

const whiteStrokeStyle: React.CSSProperties = { stroke: "#fff" };
const fadeUpHidden = { opacity: 0, y: 14 };
const fadeUpShow = { opacity: 1, y: 0 };
const easeCurve = [0.16, 1, 0.3, 1] as const;
const alertInitial = { opacity: 0, height: 0 };
const alertAnimate = { opacity: 1, height: "auto" };

function useDelay(seconds: number) {
	return { duration: 0.45, delay: seconds, ease: easeCurve };
}

export function LoginScreen({ auth }: { auth: ReturnType<typeof useAuth> }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPass, setShowPass] = useState(false);
	const [busy, setBusy] = useState(false);
	const [forgotOpen, setForgotOpen] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setBusy(true);
		await auth.login(email.trim(), password.trim());
		setBusy(false);
	}

	return (
		<div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_460px]">
			{/* Brand / product panel */}
			<div className="relative hidden overflow-hidden bg-[radial-gradient(1200px_800px_at_20%_-10%,#1B1D33_0%,#0B0C0E_55%)] p-14 text-[#F5F6F7] lg:flex lg:flex-col lg:justify-between">
				<motion.div initial={fadeUpHidden} animate={fadeUpShow} transition={useDelay(0)} className="flex items-center gap-3">
					<div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-accent">
						<LogoMark className="h-[17px] w-[17px]" style={whiteStrokeStyle} />
					</div>
					<div>
						<div className="text-sm font-extrabold tracking-tight">PORTAL MySPD</div>
						<div className="text-[11.5px] text-white/50">Seksyen Penawanan Data &middot; JUPEM</div>
					</div>
				</motion.div>

				<div className="max-w-[480px]">
					<motion.span
						initial={fadeUpHidden}
						animate={fadeUpShow}
						transition={useDelay(0.05)}
						className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-accent-2/30 bg-accent/15 px-3 py-1.5 text-[11px] font-bold text-accent-2"
					>
						&#9679; Sistem Dalaman Rasmi
					</motion.span>
					<motion.h1
						initial={fadeUpHidden}
						animate={fadeUpShow}
						transition={useDelay(0.1)}
						className="mb-4 text-[38px] font-extrabold leading-[1.15] tracking-tight"
					>
						Platform pengurusan seksyen yang lebih pantas.
					</motion.h1>
					<motion.p
						initial={fadeUpHidden}
						animate={fadeUpShow}
						transition={useDelay(0.15)}
						className="max-w-[400px] text-[14.5px] leading-relaxed text-white/55"
					>
						Dokumen rasmi, SOP, dan pengurusan staf dalam satu sistem yang selamat dan boleh dipercayai.
					</motion.p>

					<motion.div
						initial={fadeUpHidden}
						animate={fadeUpShow}
						transition={useDelay(0.22)}
						className="mt-9 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5"
					>
						<div className="mb-4 flex items-start justify-between">
							<div>
								<div className="text-[11px] font-bold uppercase tracking-wide text-white/50">Dokumen Diproses</div>
								<div className="mt-1 text-[22px] font-extrabold">1,284</div>
							</div>
							<span className="rounded-full bg-[#5EEBB8]/10 px-2 py-1 text-[11px] font-extrabold text-[#5EEBB8]">+18.2%</span>
						</div>
						<svg width="100%" height="56" viewBox="0 0 300 56" preserveAspectRatio="none">
							<polyline
								points="0,45 30,40 60,42 90,30 120,34 150,20 180,24 210,14 240,18 270,8 300,10"
								fill="none"
								stroke="#5EEBB8"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</motion.div>
				</div>

				<motion.div initial={fadeUpHidden} animate={fadeUpShow} transition={useDelay(0.3)} className="flex gap-9">
					{[
						["19", "Staf Aktif"],
						["128", "Dokumen Rasmi"],
						["99.9%", "Waktu Aktif"],
					].map(([n, l]) => (
						<div key={l}>
							<b className="block text-xl font-extrabold">{n}</b>
							<span className="text-[11px] text-white/50">{l}</span>
						</div>
					))}
				</motion.div>
			</div>

			{/* Form panel */}
			<div className="flex items-center justify-center border-l border-border bg-canvas p-8">
				<div className="w-full max-w-[340px]">
					<div className="mb-6 flex items-center gap-2.5 lg:hidden">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
							<LogoMark className="h-4 w-4" style={whiteStrokeStyle} />
						</div>
						<div className="text-sm font-extrabold tracking-tight">PORTAL MySPD</div>
					</div>

					<h2 className="mb-1 text-[21px] font-extrabold tracking-tight">Log masuk ke akaun anda</h2>
					<p className="mb-6 text-[13px] text-secondary">Selamat kembali. Sila masukkan butiran anda.</p>

					<AnimatePresence>
						{auth.error && (
							<motion.div
								initial={alertInitial}
								animate={alertAnimate}
								exit={alertInitial}
								className="mb-4 flex items-start gap-2 overflow-hidden rounded-[9px] border border-risk/30 bg-risk-soft px-2.5 py-2.5 text-[12.5px] text-risk"
							>
								<IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
								<span>{auth.error}</span>
							</motion.div>
						)}
					</AnimatePresence>

					<form onSubmit={handleSubmit} className="space-y-[15px]">
						<div>
							<label className="mb-1.5 block text-xs font-bold">Email</label>
							<input
								type="email"
								autoComplete="username"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-[9px] border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:bg-canvas focus:ring-[3.5px] focus:ring-accent-soft"
								required
							/>
						</div>
						<div>
							<label className="mb-1.5 block text-xs font-bold">Kata Laluan</label>
							<div className="relative">
								<input
									type={showPass ? "text" : "password"}
									autoComplete="current-password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full rounded-[9px] border border-border bg-surface px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-accent focus:bg-canvas focus:ring-[3.5px] focus:ring-accent-soft"
									required
								/>
								<button
									type="button"
									aria-label={showPass ? "Sorok kata laluan" : "Papar kata laluan"}
									onClick={() => setShowPass((v) => !v)}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary"
								>
									{showPass ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
								</button>
							</div>
						</div>

						<div className="flex justify-end">
							<button
								type="button"
								onClick={() => setForgotOpen(true)}
								className="text-xs font-bold text-accent"
							>
								Lupa kata laluan?
							</button>
						</div>

						<button
							type="submit"
							disabled={busy}
							className="min-h-[42px] w-full rounded-[9px] bg-ink text-[13.5px] font-bold text-white transition hover:bg-black disabled:opacity-60"
						>
							{busy ? "Log masuk..." : "Log Masuk"}
						</button>
					</form>

					<p className="mt-5 text-center text-[11.5px] text-secondary">
						Akses dihadkan kepada staf berdaftar Seksyen Penawanan Data.
					</p>
				</div>
			</div>

			<AnimatePresence>
				{forgotOpen && (
					<ForgotPasswordModal auth={auth} prefillEmail={email} onClose={() => setForgotOpen(false)} />
				)}
			</AnimatePresence>
		</div>
	);
}
