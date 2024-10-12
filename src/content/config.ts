import { defineCollection, z } from 'astro:content';

const jsProxyChapters = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		chapterNumber: z.number(),
	}),
});

export const collections = {
	['js-proxy']: jsProxyChapters,
};
