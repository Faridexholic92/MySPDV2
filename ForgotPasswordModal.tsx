"use client";

import type { Toast } from "@/lib/types";
import { IconAlertCircle, IconCheckCircle } from "@/components/icons";

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
	return (
		<div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2">
			{toasts.map((t) => (
				<div
					key={t.id}
					className={[
						"flex items-center gap-2 rounded-lg border bg-canvas px-4 py-2.5 text-sm font-medium shadow-card",
						t.type === "ok" && "border-good/30 text-good",
						t.type === "err" && "border-risk/30 text-risk",
						t.type === "info" && "border-accent/30 text-accent",
					]
						.filter(Boolean)
						.join(" ")}
				>
					{t.type === "err" ? (
						<IconAlertCircle className="h-4 w-4" />
					) : (
						<IconCheckCircle className="h-4 w-4" />
					)}
					{t.message}
				</div>
			))}
		</div>
	);
}
