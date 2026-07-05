"use client";

import { useMemo, useState, type ReactNode } from "react";

export type Column<T> = {
	key: string;
	header: string;
	width?: string;
	align?: "left" | "right" | "center";
	render?: (row: T) => ReactNode;
};

const alignClass = { left: "text-left", right: "text-right", center: "text-center" } as const;

/**
 * DataTable — jadual data gaya enterprise: header melekat, baris padat,
 * skeleton semasa memuat, empty state, dan footer pagination.
 */
export function DataTable<T extends { id: string | number }>({
	columns,
	rows,
	loading = false,
	pageSize = 8,
	emptyState,
	footerLabel = "rekod",
	onRowClick,
}: {
	columns: Column<T>[];
	rows: T[];
	loading?: boolean;
	pageSize?: number;
	emptyState?: ReactNode;
	footerLabel?: string;
	onRowClick?: (row: T) => void;
}) {
	const [page, setPage] = useState(0);
	const pages = Math.max(1, Math.ceil(rows.length / pageSize));
	const safePage = Math.min(page, pages - 1);
	const view = useMemo(() => rows.slice(safePage * pageSize, (safePage + 1) * pageSize), [rows, safePage, pageSize]);

	return (
		<div className="overflow-hidden rounded-lg glass-card shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-[13.5px]">
					<thead>
						<tr className="glass-strip border-b border-border">
							{columns.map((c) => (
								<th
									key={c.key}
									style={c.width ? { width: c.width } : undefined}
									className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-secondary ${alignClass[c.align ?? "left"]}`}
								>
									{c.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{loading
							? Array.from({ length: 5 }).map((_, i) => (
									<tr key={i} className="border-b border-border last:border-0">
										{columns.map((c) => (
											<td key={c.key} className="px-4 py-3">
												<div className="h-3.5 animate-pulse rounded bg-surface-2" />
											</td>
										))}
									</tr>
								))
							: view.map((row) => (
									<tr
										key={row.id}
										onClick={onRowClick ? () => onRowClick(row) : undefined}
										className={`border-b border-border transition-colors last:border-0 glass-row ${onRowClick ? "cursor-pointer" : ""}`}
									>
										{columns.map((c) => (
											<td key={c.key} className={`px-4 py-3 text-primary ${alignClass[c.align ?? "left"]}`}>
												{c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "\u2014")}
											</td>
										))}
									</tr>
								))}
					</tbody>
				</table>
			</div>

			{!loading && rows.length === 0 && <div className="px-4 py-10">{emptyState}</div>}

			<div className="flex items-center justify-between glass-strip border-t border-border px-4 py-2.5">
				<span className="text-[11.5px] text-secondary">
					{rows.length === 0 ? `0 ${footerLabel}` : `${safePage * pageSize + 1}\u2013${Math.min((safePage + 1) * pageSize, rows.length)} daripada ${rows.length} ${footerLabel}`}
				</span>
				<div className="flex items-center gap-1">
					<button
						disabled={safePage === 0}
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						className="rounded-md border border-border px-2.5 py-1 text-[11.5px] font-semibold text-secondary transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Sebelum
					</button>
					<span className="px-1.5 text-[11.5px] font-semibold text-secondary">
						{safePage + 1}/{pages}
					</span>
					<button
						disabled={safePage >= pages - 1}
						onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
						className="rounded-md border border-border px-2.5 py-1 text-[11.5px] font-semibold text-secondary transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Seterus
					</button>
				</div>
			</div>
		</div>
	);
}
