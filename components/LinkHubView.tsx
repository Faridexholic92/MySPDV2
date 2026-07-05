"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";

// Hub generik untuk modul yang kandungannya masih dihoskan di portal statik asal
// (https://www.myspd.qzz.io). Setiap kad membuka halaman legasi dalam tab baharu
// sehingga kandungan penuh dimigrasi ke dalam app Next.js ini.

const LEGACY_BASE = "https://www.myspd.qzz.io";

export type HubItem = {
	label: string;
	desc: string;
	path: string; // laluan relatif di portal legasi
	emoji: string;
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const ease = [0.16, 1, 0.3, 1] as const;
const t0 = { duration: 0.35, ease };
const t1 = { duration: 0.35, delay: 0.06, ease };

export function LinkHubView({
	crumbs,
	title,
	description,
	items,
}: {
	crumbs: string[];
	title: string;
	description: string;
	items: HubItem[];
}) {
	return (
		<div className="mx-auto w-full max-w-[1200px] px-8 py-8">
			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t0}>
				<PageHeader crumbs={crumbs} title={title} description={description} />
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t1} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{items.map((it) => (
					<a
						key={it.path}
						href={`${LEGACY_BASE}${it.path}`}
						target="_blank"
						rel="noreferrer"
						className="group glass-hover flex items-start gap-3.5 rounded-lg glass-card p-4 shadow-sm transition-colors hover:border-accent"
					>
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-[18px]">{it.emoji}</span>
						<span className="min-w-0 flex-1">
							<span className="flex items-center justify-between gap-2">
								<b className="truncate text-[13px] font-bold text-primary">{it.label}</b>
								<span aria-hidden className="text-[13px] text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
									{"\u2197"}
								</span>
							</span>
							<span className="mt-0.5 block text-[13px] leading-relaxed text-secondary">{it.desc}</span>
							<span className="mt-2 inline-block rounded-md bg-surface-2 px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-wide text-secondary">
								Portal Legasi
							</span>
						</span>
					</a>
				))}
			</motion.div>

			<motion.div variants={fadeUp} initial="hidden" animate="show" transition={t1} className="mt-5 rounded-lg border border-border bg-surface px-4 py-3 text-[13px] text-secondary">
				Kandungan modul ini masih dihoskan di portal asal. Pautan dibuka dalam tab baharu; migrasi penuh boleh dilakukan berperingkat tanpa mengganggu operasi.
			</motion.div>
		</div>
	);
}

export function DokumenRasmiView() {
	return (
		<LinkHubView
			crumbs={["Dokumen", "Dokumen Rasmi"]}
			title="Portal Dokumen Rasmi"
			description="SOP, manual kerja, minit mesyuarat dan pekeliling rasmi seksyen."
			items={[
				{ label: "SOP Operasi", desc: "Prosedur operasi standard bagi kerja-kerja ukur dan pemetaan.", path: "/portal-dokumen-rasmi/sop-operasi/", emoji: "\ud83d\udccb" },
				{ label: "Manual Kerja", desc: "Manual dan garis panduan kerja terperinci mengikut unit.", path: "/portal-dokumen-rasmi/manual-kerja/", emoji: "\ud83d\udcd8" },
				{ label: "Borang", desc: "Koleksi borang rasmi untuk kegunaan dalaman seksyen.", path: "/portal-dokumen-rasmi/borang/", emoji: "\ud83d\udcdd" },
				{ label: "Minit Mesyuarat Seksyen", desc: "Rekod minit mesyuarat seksyen mengikut siri dan tahun.", path: "/portal-dokumen-rasmi/minit-mesyuarat-seksyen/", emoji: "\ud83d\uddc3\ufe0f" },
				{ label: "Pekeliling JPA", desc: "Pekeliling perkhidmatan dan surat edaran JPA terkini.", path: "/portal-dokumen-rasmi/pekeliling-jpa/", emoji: "\ud83d\udce2" },
			]}
		/>
	);
}

export function EksaView() {
	return (
		<LinkHubView
			crumbs={["Kualiti & Komuniti", "EKSA MySPD"]}
			title="EKSA MySPD"
			description="Ekosistem Kondusif Sektor Awam \u2014 eviden, polisi dan pengurusan zon."
			items={[
				{ label: "Aktiviti & Galeri", desc: "Galeri eviden aktiviti EKSA mengikut siri pelaksanaan.", path: "/eksa-myspd/aktiviti-galeri/", emoji: "\ud83d\udcf8" },
				{ label: "Carta Organisasi", desc: "Struktur jawatankuasa pelaksana EKSA seksyen.", path: "/eksa-myspd/carta-organisasi/", emoji: "\ud83e\udded" },
				{ label: "Polisi & Objektif", desc: "Pernyataan polisi, objektif dan sasaran EKSA.", path: "/eksa-myspd/polisi-objektif/", emoji: "\ud83c\udfaf" },
				{ label: "Zon EKSA", desc: "Pembahagian zon tanggungjawab dan pelan lantai.", path: "/eksa-myspd/zone-eksa/", emoji: "\ud83d\uddfa\ufe0f" },
			]}
		/>
	);
}

export function PerayaanView() {
	return (
		<LinkHubView
			crumbs={["Kualiti & Komuniti", "Perayaan"]}
			title="Perayaan & Sambutan"
			description="E-kad ucapan dan hebahan sambutan perayaan seksyen."
			items={[
				{ label: "Tahun Baru Cina", desc: "E-kad ucapan sempena sambutan Tahun Baru Cina.", path: "/perayaan/cny/", emoji: "\ud83c\udfee" },
				{ label: "Ramadan & Aidilfitri", desc: "E-kad ucapan sempena Ramadan dan Hari Raya.", path: "/perayaan/ramadan/", emoji: "\ud83c\udf19" },
			]}
		/>
	);
}
