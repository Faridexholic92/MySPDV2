import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class",
	content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
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
				lg: "12px",
			},
			boxShadow: {
				card: "0 1px 2px rgba(0,0,0,.05), 0 4px 12px rgba(0,0,0,.04)",
			},
		},
	},
	plugins: [],
};

export default config;
