"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { useAuth } from "@/hooks/useAuth";
import type { AuthedUser } from "@/lib/types";
import { IconX } from "@/components/icons";

const backdropInitial = { opacity: 0 };
const backdropAnimate = { opacity: 1 };
const cardInitial = { opacity: 0, scale: 0.97, y: 10 };
const cardAnimate = { opacity: 1, scale: 1, y: 0 };
const cardExit = { opacity: 0, scale: 0.98, y: 6 };
const cardTransition = { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const };

export function ProfileModal({
	auth,
	user,
	onClose,
	showToast,
}: {
	auth: ReturnType<typeof useAuth>;
	user: AuthedUser;
	onClose: () => void;
	showToast: (msg: string, type?: "info" | "ok" | "err") => void;
}) {
	const [nama, setNama] = useState(user.nama || "");
	const [jawatan, setJawatan] = useState(user.jawatan || "");
	const [gred, setGred] = useState(user.gred || "");
	const [cawangan, setCawangan] = useState(user.cawangan || "");
	const [noTel, setNoTel] = useState(user.no_tel || "");
	const [busy, setBusy] = useState(false);
	const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

	async function save() {
		if (!nama.trim()) {
			setMsg({ text: "Nama tidak boleh kosong.", ok: false });
			return;
		}
		setBusy(true);
		try {
			const { error } = await auth.sb.rpc("update_my_profile", {
				p_nama: nama.trim(),
				p_jawatan: jawatan.trim(),
				p_gred: gred.trim(),
				p_cawangan: cawangan.trim(),
				p_no_tel: noTel.trim(),
			});
			if (error) throw error;
			showToast("Profil dikemaskini.", "ok");
			onClose();
		} catch (e) {
			setMsg({ text: "Gagal simpan: " + ((e as Error)?.message || "Cuba lagi."), ok: false });
		} finally {
			setBusy(false);
		}
	}

	const fields: Array<[string, string, (v: string) => void]> = [
		["Nama", nama, setNama],
		["Jawatan", jawatan, setJawatan],
		["Gred", gred, setGred],
		["Cawangan", cawangan, setCawangan],
		["No. Tel", noTel, setNoTel],
	];

	return (
		<motion.div
			initial={backdropInitial}
			animate={backdropAnimate}
			exit={backdropInitial}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
			onClick={onClose}
		>
			<motion.div
				initial={cardInitial}
				animate={cardAnimate}
				exit={cardExit}
				transition={cardTransition}
				className="w-full max-w-md rounded-2xl border border-border bg-canvas p-6 shadow-card"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-sm font-extrabold">Sunting Profil</h2>
					<button onClick={onClose} className="text-secondary" aria-label="Tutup">
						<IconX className="h-4 w-4" />
					</button>
				</div>
				<div className="space-y-3">
					{fields.map(([label, value, setter]) => (
						<div key={label}>
							<label className="mb-1.5 block text-[12.5px] font-bold">{label}</label>
							<input
								value={value}
								onChange={(e) => setter(e.target.value)}
								className="w-full rounded-[9px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-[3.5px] focus:ring-accent-soft"
							/>
						</div>
					))}
				</div>
				{msg && (
					<div className="mt-3 rounded-[9px] border border-risk/30 bg-risk-soft px-3 py-2 text-xs text-risk">
						{msg.text}
					</div>
				)}
				<div className="mt-5 flex justify-end gap-2">
					<button onClick={onClose} className="px-3 py-2 text-xs font-bold text-secondary">
						Batal
					</button>
					<button
						onClick={save}
						disabled={busy}
						className="rounded-[9px] bg-ink px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
					>
						{busy ? "Menyimpan..." : "Simpan"}
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
