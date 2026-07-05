"use client";

import { useCallback, useEffect, useState } from "react";

export function useTheme() {
	const [theme, setThemeState] = useState<"dark" | "light">("dark");

	useEffect(() => {
		const saved = localStorage.getItem("myspdTheme");
		const initial = saved === "light" ? "light" : "dark";
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
