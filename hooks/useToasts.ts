"use client";

import { useCallback, useRef, useState } from "react";
import type { Toast, ToastType } from "@/lib/types";

export function useToasts() {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const idRef = useRef(0);

	const showToast = useCallback((message: string, type: ToastType = "info", ms = 3200) => {
		const id = ++idRef.current;
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, ms);
	}, []);

	return { toasts, showToast };
}
