import { expect, test } from '@jupyterlab/galata';

function delay(ms: number) {
  // https://stackoverflow.com/questions/37764665/how-to-implement-sleep-function-in-typescript
  return new Promise( resolve => setTimeout(resolve, ms) );
}

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

test.use({ autoGoto: true });
test('should work run-through button and show summary of outputs in collapsed heading cell', async ({ page }) => {
  // create new notebook
  const fileName = "run_through_test.ipynb";
  await page.notebook.createNew(fileName);
  await page.waitForSelector(`[role="main"] >> text=${fileName}`);
  // caption
  await page.notebook.setCell(0, 'markdown', '# Run through');
  // 1st code
  await page.notebook.addCell('code', 'print("Successful")');
  // 2nd code
  await page.notebook.addCell('code', 'assert False');
  // run
  await page.notebook.run();
  // 3rd code
  await page.notebook.addCell('code', 'print("Not executed")');
  // click collapse heading button
  await page.hover('.jp-InputArea-prompt');
  await page.locator('.jp-collapseHeadingButton').click();
  // check icons
  let parentOfCells = await page.locator('.run-through-section-cells');
  let cells = await parentOfCells.locator('.run-through-code-result');
  // icon1 (Success)
  await expect(cells.nth(0)).toHaveClass(/run-through-code-result__success/);
  // icon2 (Error)
  await expect(cells.nth(1)).toHaveClass(/run-through-code-result__error/);
  // icon3 (Gray)
  await expect(cells.nth(2)).not.toHaveClass(/run-through-code-result__success/);
  await expect(cells.nth(2)).not.toHaveClass(/run-through-code-code/);

  // click collapse heading button (open)
  await page.hover('.jp-InputArea-prompt');
  await page.locator('.jp-collapseHeadingButton').click();
  // Unfreeze 1st code
  await page.notebook.selectCells(1, 1);
  await page.locator('.run-through-toolbar-button__unfreeze').click();
  // Edit 1st code (Error code)
  await page.notebook.setCell(1, 'code', 'assert False\n');
  // Freeze 1st code
  await page.locator('.run-through-toolbar-button__freeze').click();
  // click collapse heading button (close)
  await page.hover('.jp-InputArea-prompt');
  await page.locator('.jp-collapseHeadingButton').click();
  // click run through button
  await page.locator('.run-through-button').click();
  // icon1 (Success)
  await expect(cells.nth(0)).toHaveClass(/run-through-code-result__success/);

  // click collapse heading button (open)
  await page.hover('.jp-InputArea-prompt');
  await page.locator('.jp-collapseHeadingButton').click();
  // Unfreeze 1st code
  await page.notebook.selectCells(1, 1);
  await page.locator('.run-through-toolbar-button__unfreeze').click();
  // click collapse heading button (close)
  await page.hover('.jp-InputArea-prompt');
  await page.locator('.jp-collapseHeadingButton').click();
  // click run through button
  await page.locator('.run-through-button').click();
  // icon1 (Error)
  await expect(cells.nth(0)).toHaveClass(/run-through-code-result__error/);

  // click collapse heading button (open)
  await page.hover('.jp-InputArea-prompt');
  await page.locator('.jp-collapseHeadingButton').click();
  // add Cell
  await page.notebook.addCell('code', '');
  // Lock 4th code
  await page.notebook.selectCells(4, 4);
  await page.locator('[title^="make selected cells read-only"]').click();
  // Edit 4th code
  await page.notebook.setCell(4, 'code', 'print("lock test")');
  // Run
  await page.notebook.runCell(4);
  let output = await page.notebook.getCellTextOutput(4);
  expect(output).toBeNull();
  // Unlock 4th code
  await page.notebook.selectCells(4, 4);
  await page.locator('[title^="make selected cells editable"]').click();
  // Edit 4th code
  await page.notebook.setCell(4, 'code', 'print("unlock test")');
  // Run
  await page.notebook.runCell(4);
  output = await page.notebook.getCellTextOutput(4);
  expect(output).not.toBeNull();
  expect(output![0]).toContain('unlock test');
});

test('should work unfreeze below in section button and unfreeze below all button', async ({ page }) => {
  // create new notebook
  const fileName = "run_through_test.ipynb";
  await page.notebook.createNew(fileName);
  await page.waitForSelector(`[role="main"] >> text=${fileName}`);
  // caption
  await page.notebook.setCell(0, 'markdown', '# Section1');
  // 1st code
  await page.notebook.addCell('code', 'print("1st")');
  // 2nd code
  await page.notebook.addCell('code', 'print("2nd")');
  // 3rd code
  await page.notebook.addCell('code', 'print("3rd")');
  // caption
  await page.notebook.addCell('markdown', '# Section2');
  // 4th code
  await page.notebook.addCell('code', 'print("4th")');
  // 5th code
  await page.notebook.addCell('code', 'print("5th")');
  // 6th code
  await page.notebook.addCell('code', 'print("6th")');
  // Run
  await page.notebook.run();
  
  // Unfreeze and add text all cells
  const allCellIndexes = [1, 2, 3, 5, 6, 7];
  await page.notebook.selectCells(1, 1);
  await page.locator('.run-through-toolbar-button__unfreeze-all').click();
  for(let idx of allCellIndexes) {
    await page.notebook.setCell(idx, 'code', 'print("add1")\n');
  }

  // freeze all cells
  await delay(1000);
  for(let idx of allCellIndexes) {
    page.notebook.selectCells(idx, idx);
    await delay(500);
    await page.locator('.run-through-toolbar-button__freeze').click();
  }

  // Unfreeze 2nd, 3rd codes
  await page.notebook.selectCells(2, 2);
  await delay(500);
  await page.locator('.run-through-toolbar-button__unfreeze-section').click();
  await page.notebook.runCellByCell();
  let output1 = await page.notebook.getCellTextOutput(1);
  expect(output1![0]).not.toContain('add1');
  let output2 = await page.notebook.getCellTextOutput(2);
  expect(output2![0]).toContain('add1');
  let output3 = await page.notebook.getCellTextOutput(3);
  expect(output3![0]).toContain('add1');
  let output4 = await page.notebook.getCellTextOutput(5);
  expect(output4![0]).not.toContain('add1');
  let output5 = await page.notebook.getCellTextOutput(6);
  expect(output5![0]).not.toContain('add1');
  let output6 = await page.notebook.getCellTextOutput(7);
  expect(output6![0]).not.toContain('add1');
  await delay(1000);

  // Unfreeze 2nd, 3rd, 4th, 5th, 6th codes
  await page.notebook.selectCells(2, 2);
  await delay(500);
  await page.locator('.run-through-toolbar-button__unfreeze-all').click();
  await page.notebook.runCellByCell();
  let output2_1 = await page.notebook.getCellTextOutput(1);
  expect(output2_1![0]).not.toContain('add1');
  let output2_2 = await page.notebook.getCellTextOutput(2);
  expect(output2_2![0]).toContain('add1');
  let output2_3 = await page.notebook.getCellTextOutput(3);
  expect(output2_3![0]).toContain('add1');
  let output2_4 = await page.notebook.getCellTextOutput(5);
  expect(output2_4![0]).toContain('add1');
  let output2_5 = await page.notebook.getCellTextOutput(6);
  expect(output2_5![0]).toContain('add1');
  let output2_6 = await page.notebook.getCellTextOutput(7);
  expect(output2_6![0]).toContain('add1');
});