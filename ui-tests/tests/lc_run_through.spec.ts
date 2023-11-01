import { expect, test } from '@jupyterlab/galata';

/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false });
test('should emit an activation console message', async ({ page }) => {
  const logs: string[] = [];

  page.on('console', message => {
    logs.push(message.text());
  });
  // load jupyter lab
  await page.goto();

  expect(
    logs.filter(s => s === 'JupyterLab extension lc_run_through is activated!')
  ).toHaveLength(1);
});