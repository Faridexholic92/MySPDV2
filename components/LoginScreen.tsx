"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";
import { LogoMark, IconEye, IconEyeOff, IconAlertCircle } from "@/components/icons";

const gridPatternStyle: React.CSSProperties = {
	backgroundImage:
		"linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
	backgroundSize: "44px 44px",
	maskImage: "radial-gradient(circle at 30% 20%, black 0%, transparent 70%)",
	WebkitMaskImage: "radial-gradient(circle at 30% 20%, black 0%, transparent 70%)",
};

const glowStyle: React.CSSProperties = {
	background: "radial-gradient(circle, rgba(39,131,222,.35), transparent 70%)",
};

const whiteStrokeStyle: React.CSSProperties = { stroke: "#fff" };

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
		<div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
			{/* Brand panel */}
			<div className="relative hidden overflow-hidden bg-gradient-to-br from-[#1c3a63] via-[#123056] to-[#0b2036] p-14 text-white lg:flex lg:flex-col lg:justify-between">
				<div className="pointer-events-none absolute inset-0 opacity-40" style={gridPatternStyle} />
				<div
					className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full"
					style={glowStyle}
				/>

				<div className="relative flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent">
						<LogoMark className="h-5 w-5" style={whiteStrokeStyle} />
					</div>
					<div>
						<div className="text-[15px] font-extrabold tracking-wide">PORTAL MySPD</div>
						<div className="text-xs text-white/55">Seksyen Penawanan Data &middot; JUPEM</div>
					</div>
				</div>

				<div className="relative max-w-md">
					<h1 className="mb-3.5 text-[32px] font-extrabold leading-tight tracking-tight">
						Satu portal untuk semua rujukan kerja seksyen.
					</h1>
					<p className="text-[14.5px] leading-relaxed text-white/70">
						Akses dokumen rasmi, SOP, manual kerja dan minit mesyuarat dengan pantas, teratur dan selamat.
					</p>
				</div>

				<div className="relative flex gap-8">
					{[
						["120+", "Dokumen Rasmi"],
						["18", "SOP Aktif"],
						["24/7", "Capaian Dalam Talian"],
					].map(([n, l]) => (
						<div key={l}>
							<b className="block text-[22px] font-extrabold">{n}</b>
							<span className="text-xs text-white/55">{l}</span>
						</div>
					))}
				</div>
			</div>

			{/* Form panel */}
			<div className="flex items-center justify-center bg-canvas p-8">
				<div className="w-full max-w-[360px]">
					<div className="mb-7 flex items-center gap-2.5 lg:hidden">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-accent">
							<LogoMark className="h-[18px] w-[18px]" style={whiteStrokeStyle} />
						</div>
						<div className="text-[15px] font-extrabold tracking-wide">PORTAL MySPD</div>
					</div>

					<h2 className="mb-1.5 text-[22px] font-extrabold tracking-tight">Log masuk</h2>
					<p className="mb-7 text-[13.5px] text-secondary">
						Masukkan butiran akaun rasmi anda untuk teruskan.
					</p>

					{auth.error && (
						<div className="mb-4 flex items-start gap-2 rounded-lg border border-risk/30 bg-risk-soft px-3 py-2.5 text-[13px] text-risk">
							<IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
							<span>{auth.error}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="mb-1.5 block text-[12.5px] font-semibold">Email</label>
							<input
								type="email"
								autoComplete="username"
								placeholder="nama@jupem.gov.my"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:bg-canvas focus:ring-4 focus:ring-accent-soft"
								required
							/>
						</div>
						<div>
							<label className="mb-1.5 block text-[12.5px] font-semibold">Kata Laluan</label>
							<div className="relative">
								<input
									type={showPass ? "text" : "password"}
									autoComplete="current-password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-accent focus:bg-canvas focus:ring-4 focus:ring-accent-soft"
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

						<div className="flex items-center justify-end">
							<button
								type="button"
								onClick={() => setForgotOpen(true)}
								className="text-[12.5px] font-semibold text-accent"
							>
								Lupa kata laluan?
							</button>
						</div>

						<button
							type="submit"
							disabled={busy}
							className="min-h-[44px] w-full rounded-lg bg-accent text-sm font-bold text-white shadow-card transition hover:brightness-95 disabled:opacity-60"
						>
							{busy ? "Log masuk..." : "Log Masuk"}
						</button>
					</form>

					<p className="mt-6 text-center text-xs text-secondary">
						Akses dihadkan kepada staf berdaftar Seksyen Penawanan Data.
					</p>
				</div>
			</div>

			{forgotOpen && (
				<ForgotPasswordModal auth={auth} prefillEmail={email} onClose={() => setForgotOpen(false)} />
			)}
		</div>
	);
}
