"use client";

import { useState } from "react";
import type { useAuth } from "@/hooks/useAuth";
import type { AuthedUser } from "@/lib/types";
import { IconX } from "@/components/icons";

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
			// Kekal guna RPC sedia ada di Supabase (update_my_profile) - server
			// tetap sahkan pengguna hanya boleh kemaskini profil sendiri melalui RLS.
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
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-md rounded-lg border border-border bg-canvas p-6 shadow-card"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-sm font-bold">Sunting Profil</h2>
					<button onClick={onClose} className="text-secondary" aria-label="Tutup">
						<IconX className="h-4 w-4" />
					</button>
				</div>
				<div className="space-y-3">
					{fields.map(([label, value, setter]) => (
						<div key={label}>
							<label className="mb-1.5 block text-[12.5px] font-semibold">{label}</label>
							<input
								value={value}
								onChange={(e) => setter(e.target.value)}
								className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
							/>
						</div>
					))}
				</div>
				{msg && (
					<div className="mt-3 rounded-lg border border-risk/30 bg-risk-soft px-3 py-2 text-xs text-risk">
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
						className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
					>
						{busy ? "Menyimpan..." : "Simpan"}
					</button>
				</div>
			</div>
		</div>
	);
}
