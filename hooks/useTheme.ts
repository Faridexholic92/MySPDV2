"use client";

import { useCallback, useEffect, useState } from "react";

export function useTheme() {
	// Default theme is light to match the new professional design system.
	const [theme, setThemeState] = useState<"dark" | "light">("light");

	useEffect(() => {
		const saved = localStorage.getItem("myspdTheme");
		const initial = saved === "dark" ? "dark" : "light";
		setThemeState(initial);
		document.documentElement.classList.toggle("dark", initial === "dark");
	}, []);

	const setTheme = useCallback((next: "dark" | "light") => {
		setThemeState(next);
		localStorage.setItem("myspdTheme", next);
		document.documentElement.classList.toggle("dark", next === "dark");
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme, setTheme]);

	return { theme, setTheme, toggleTheme };
}
