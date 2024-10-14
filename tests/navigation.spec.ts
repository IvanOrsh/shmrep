import { test, expect } from '@playwright/test';
test('navigation smoke test', async ({ page }) => {
	// start at the home page
	await page.goto('/');
	await expect(page).toHaveTitle(/Shmrep/);

	// navigate to Courses
	await page.getByRole('heading', { name: 'courses', level: 2 }).click();
	// should get you straight to the only course, SvelteKit/Learn
	await expect(page).toHaveTitle(/JavaScript Proxy\/Learn/);
	await expect(
		page.getByRole('heading', {
			name: 'Learn about JavaScript Proxy',
			level: 1,
		}),
	).toBeVisible();

	// navigate back home
	await page.getByRole('link', { name: 'Shmrep' }).click();
	await expect(page).toHaveTitle(/Shmrep/);

	// navigate to Play
	await page.getByRole('heading', { name: 'play', level: 2 }).click();
	await expect(page).toHaveTitle(/Play/);
	await expect(
		page.getByRole('heading', {
			name: 'Play',
			level: 1,
		}),
	).toBeVisible();
});
