import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					"var(--font-inter)",
					"Inter",
					"ui-sans-serif",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"Roboto",
					"Helvetica Neue",
					"Arial",
					"Noto Sans",
					"sans-serif",
					"Apple Color Emoji",
					"Segoe UI Emoji",
					"Segoe UI Symbol",
					"Noto Color Emoji",
				],
			},
			fontSize: {
				'2xs': ['0.5rem', { lineHeight: '0.75rem' }], // 8px
				xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
				sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
				base: ["1rem", { lineHeight: "1.5rem" }], // 16px
				lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
				xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px (H4)
				"2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px (H3)
				"3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px (H2)
				"4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px (H1)
			},
			colors: {
				black: "#000000",
				dark: {
					DEFAULT: "#111111",
					hover: "#1a1a1a",
				},
				border: "#2D2D2D",
				accent: {
					DEFAULT: "#6B46C1",
					light: "#9F7AEA",
				},
				text: {
					DEFAULT: "#FFFFFF",
					muted: "#A1A1AA",
				},
				success: "#10B981",
				warning: "#F59E0B",
				error: "#EF4444",
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
			boxShadow: {
				glow: "0 0 12px rgba(107, 70, 193, 0.25)",
				"glow-lg": "0 0 24px rgba(107, 70, 193, 0.35)",
			},
			keyframes: {
				pulse: {
					"0%, 100%": { transform: "scale(1)" },
					"50%": { transform: "scale(1.02)" },
				},
			},
			animation: {
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				"spin-slow": "spin 3s linear infinite",
			},
			spacing: {
				"18": "4.5rem", // 72px
				"22": "5.5rem", // 88px
				"26": "6.5rem", // 104px
				"30": "7.5rem", // 120px
				"34": "8.5rem", // 136px
				"38": "9.5rem", // 152px
			},
			zIndex: {
				dropdown: "10",
				sticky: "20",
				modal: "30",
				toast: "40",
				tooltip: "50",
			},
		},
	},
	plugins: [],
};

export default config;
