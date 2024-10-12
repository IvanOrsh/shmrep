// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import partytown from '@astrojs/partytown';

import solidJs from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
	i18n: {
		defaultLocale: 'en',
		locales: ['es', 'en', 'pt-br'],
	},

	markdown: {
		shikiConfig: {
			theme: 'dracula',
		},
	},

	prefetch: true,
	integrations: [
		tailwind({
			applyBaseStyles: false,
		}),
		partytown(),
		solidJs(),
	],
});
