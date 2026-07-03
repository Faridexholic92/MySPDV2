"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Toast } from "@/lib/types";
import { IconAlertCircle, IconCheck } from "@/components/icons";

const toastInitial = { opacity: 0, y: -10, scale: 0.96 };
const toastAnimate = { opacity: 1, y: 0, scale: 1 };
const toastExit = { opacity: 0, x: 30, scale: 0.96 };
const toastTransition = { type: "spring" as const, stiffness: 460, damping: 34 };

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
	return (
		<div className="pointer-events-none fixed right-5 top-5 z-[999] flex flex-col gap-2">
			<AnimatePresence>
				{toasts.map((t) => (
					<motion.div
						key={t.id}
						layout
						initial={toastInitial}
						animate={toastAnimate}
						exit={toastExit}
						transition={toastTransition}
						className={[
							"pointer-events-auto flex items-center gap-2 rounded-xl border bg-canvas px-4 py-2.5 text-sm font-medium shadow-card",
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
							<IconCheck className="h-4 w-4" />
						)}
						{t.message}
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
