"use client";

import type { ComponentType } from "react";

export type StatTone = "accent" | "good" | "warn" | "risk" | "neutral";

const toneText: Record<StatTone, string> = {
	accent: "text-accent",
	good: "text-good",
	warn: "text-warn",
	risk: "text-risk",
	neutral: "text-secondary",
};
const toneSoft: Record<StatTone, string> = {
	accent: "bg-accent-soft text-accent",
	good: "bg-good-soft text-good",
	warn: "bg-warn-soft text-warn",
	risk: "bg-risk-soft text-risk",
	neutral: "bg-surface-2 text-secondary",
};
const toneStroke: Record<StatTone, string> = {
	accent: "var(--accent)",
	good: "var(--good)",
	warn: "var(--warn)",
	risk: "var(--risk)",
	neutral: "var(--border)",
};

/** Sparkline SVG ringkas — trend mini di dalam kad statistik. */
export function Sparkline({ data, tone = "accent", width = 96, height = 30 }: { data: number[]; tone?: StatTone; width?: number; height?: number }) {
	if (data.length < 2) return null;
	const min = Math.min(...data);
	const max = Math.max(...data);
	const span = max - min || 1;
	const step = width / (data.length - 1);
	const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(height - 3 - ((v - min) / span) * (height - 6)).toFixed(1)}`);
	const d = `M${pts.join(" L")}`;
	const areaD = `${d} L${width},${height} L0,${height} Z`;
	return (
		<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="shrink-0">
			<path d={areaD} fill={toneStroke[tone]} opacity="0.09" />
			<path d={d} fill="none" stroke={toneStroke[tone]} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

/**
 * StatCard — kad statistik data-dense dengan delta % dan sparkline.
 * `value` string supaya boleh papar "—" bila data disekat RLS.
 */
export function StatCard({
	label,
	value,
	sub,
	delta,
	trend,
	tone = "accent",
	Icon,
}: {
	label: string;
	value: string;
	sub?: string;
	delta?: { value: string; up: boolean };
	trend?: number[];
	tone?: StatTone;
	Icon?: ComponentType<{ className?: string }>;
}) {
	return (
		<div className="rounded-lg glass-card p-4 shadow-sm">
			<div className="flex items-center justify-between gap-2">
				<span className="text-[11.5px] font-semibold uppercase tracking-wide text-secondary">{label}</span>
				{Icon && (
					<span className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneSoft[tone]}`}>
						<Icon className="h-3.5 w-3.5" />
					</span>
				)}
			</div>
			<div className="mt-2 flex items-end justify-between gap-3">
				<div className="min-w-0">
					<div className="flex items-baseline gap-2">
						<span className="text-[26px] font-bold leading-none tracking-[-0.02em] text-primary">{value}</span>
						{delta && (
							<span className={`text-[11.5px] font-bold ${delta.up ? "text-good" : "text-risk"}`}>
								{delta.up ? "\u2191" : "\u2193"} {delta.value}
							</span>
						)}
					</div>
					{sub && <div className="mt-1.5 truncate text-[11.5px] text-secondary">{sub}</div>}
				</div>
				{trend && <Sparkline data={trend} tone={tone} />}
			</div>
		</div>
	);
}

export { toneText, toneSoft };
