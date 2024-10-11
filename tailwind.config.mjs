import typography from '@tailwindcss/typography';

const withAlphaValue = (varName) => `hsl(var(--${varName}) / <alpha-value>)`


/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
    fontFamily: {
			sans: "'Raleway Variable', system-ui, sans-serif",
		},
		extend: {
			colors: {
				foreground: {
					brand: withAlphaValue('foreground-brand-color'),
					accent: withAlphaValue('foreground-accent-color'),
				},
				surface: {
					brand: {
						1: withAlphaValue('surface-brand-1-color'),
						2: withAlphaValue('surface-brand-2-color'),
					},
					accent: {
						1: withAlphaValue('surface-accent-1-color'),
					},
				},
			},
		},
	},
	plugins: [typography],
}
