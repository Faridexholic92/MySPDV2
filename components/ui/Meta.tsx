"use client";

import type { ComponentType, ReactNode } from "react";

export type PillTone = "accent" | "good" | "warn" | "risk" | "neutral";

const pillTone: Record<PillTone, string> = {
	accent: "bg-accent-soft text-accent",
	good: "bg-good-soft text-good",
	warn: "bg-warn-soft text-warn",
	risk: "bg-risk-soft text-risk",
	neutral: "bg-surface-2 text-secondary",
};

/** StatusPill — label status kecil dengan titik warna. */
export function StatusPill({ tone, children }: { tone: PillTone; children: ReactNode }) {
	return (
		<span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-[3px] text-[11px] font-bold ${pillTone[tone]}`}>
			<span className="h-1.5 w-1.5 rounded-full bg-current" />
			{children}
		</span>
	);
}

/** ProgressBar — bar kemajuan dengan warna semantik ikut nilai. */
export function ProgressBar({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
	const v = Math.max(0, Math.min(100, value));
	const tone = v >= 100 ? "bg-good" : v >= 40 ? "bg-accent" : "bg-warn";
	return (
		<div className="flex items-center gap-2.5">
			<div className="h-1.5 w-full min-w-[64px] max-w-[140px] overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
				<div className={`h-full rounded-full ${tone} transition-[width] duration-500`} style={{ width: `${v}%` }} />
			</div>
			{showLabel && <span className="w-9 shrink-0 text-right text-[11.5px] font-bold tabular-nums text-primary">{v}%</span>}
		</div>
	);
}

/** EmptyState — keadaan kosong yang jelas, bukan jadual kosong senyap. */
export function EmptyState({
	Icon,
	title,
	description,
	action,
}: {
	Icon?: ComponentType<{ className?: string }>;
	title: string;
	description?: string;
	action?: ReactNode;
}) {
	return (
		<div className="flex flex-col items-center justify-center gap-1.5 text-center">
			{Icon && (
				<span className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-secondary">
					<Icon className="h-5 w-5" />
				</span>
			)}
			<b className="text-[13px] font-bold text-primary">{title}</b>
			{description && <p className="max-w-[320px] text-[13px] leading-relaxed text-secondary">{description}</p>}
			{action && <div className="mt-2">{action}</div>}
		</div>
	);
}

/** SegmentedTabs — penapis kategori gaya produk (bukan butang kabur). */
export function SegmentedTabs({
	tabs,
	active,
	onChange,
}: {
	tabs: Array<{ key: string; label: string; count?: number }>;
	active: string;
	onChange: (key: string) => void;
}) {
	return (
		<div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-surface p-1" role="tablist">
			{tabs.map((t) => {
				const is = t.key === active;
				return (
					<button
						key={t.key}
						role="tab"
						aria-selected={is}
						onClick={() => onChange(t.key)}
						className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${
							is ? "bg-canvas text-primary shadow-sm" : "text-secondary hover:text-primary"
						}`}
					>
						{t.label}
						{typeof t.count === "number" && (
							<span className={`rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums ${is ? "bg-accent-soft text-accent" : "bg-surface-2 text-secondary"}`}>
								{t.count}
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
}
