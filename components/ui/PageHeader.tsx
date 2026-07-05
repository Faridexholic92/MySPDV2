"use client";

import type { ReactNode } from "react";

/**
 * PageHeader — kepala halaman standard untuk semua modul.
 * Breadcrumb + tajuk + meta (cth. status live) + slot tindakan di kanan.
 */
export function PageHeader({
	crumbs,
	title,
	description,
	meta,
	actions,
}: {
	crumbs: string[];
	title: string;
	description?: string;
	meta?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-start justify-between gap-3 pb-6">
			<div className="min-w-0">
				<div className="mb-1 flex items-center gap-1.5 text-[11.5px] font-medium text-secondary">
					{crumbs.map((c, i) => (
						<span key={c} className="flex items-center gap-1.5">
							{i > 0 && <span className="text-secondary/50">/</span>}
							{c}
						</span>
					))}
				</div>
				<div className="flex items-center gap-2.5">
					<h1 className="text-grad text-[24px] font-extrabold tracking-[-0.02em]">{title}</h1>
					{meta}
				</div>
				{description && <p className="mt-1 text-[13.5px] text-secondary">{description}</p>}
			</div>
			{actions && <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>}
		</div>
	);
}

/** Pill kecil "LIVE" / status segerak untuk letak sebelah tajuk. */
export function LivePill({ label = "Live" }: { label?: string }) {
	return (
		<span className="flex items-center gap-1.5 rounded-full bg-good-soft px-2 py-[3px] text-[10px] font-bold uppercase tracking-wide text-good">
			<span className="relative flex h-1.5 w-1.5">
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-60 motion-reduce:animate-none" />
				<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-good" />
			</span>
			{label}
		</span>
	);
}
