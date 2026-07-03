import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class",
	content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				ink: "var(--ink)",
				"ink-2": "var(--ink-2)",
				canvas: "var(--canvas)",
				surface: "var(--surface)",
				"surface-2": "var(--surface-2)",
				border: "var(--border)",
				primary: "var(--text-primary)",
				secondary: "var(--text-secondary)",
				accent: "var(--accent)",
				"accent-soft": "var(--accent-soft)",
				good: "var(--good)",
				"good-soft": "var(--good-soft)",
				warn: "var(--warn)",
				"warn-soft": "var(--warn-soft)",
				risk: "var(--risk)",
				"risk-soft": "var(--risk-soft)",
			},
			borderRadius: {
				DEFAULT: "8px",
				lg: "14px",
			},
			boxShadow: {
				sm: "0 1px 2px rgba(16,17,20,.04), 0 1px 1px rgba(16,17,20,.03)",
				card: "0 4px 16px rgba(16,17,20,.06), 0 1px 2px rgba(16,17,20,.04)",
			},
		},
	},
	plugins: [],
};

export default config;
