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

async function waitForNotebookReady(page: any) {
  // Wait for notebook to be active
  await page.waitForSelector('.jp-Notebook.jp-mod-commandMode, .jp-Notebook.jp-mod-editMode', { timeout: 10000 });
  // Wait a bit for any pending operations
  await page.waitForTimeout(300);
}

test.use({ autoGoto: true });
test('should work run-through button and show summary of outputs in collapsed heading cell', async ({ page }) => {
  // create new notebook
  const fileName = "run_through_test.ipynb";
  await page.notebook.createNew(fileName);
  await page.waitForSelector(`[role="main"] >> text=${fileName}`);
  await waitForNotebookReady(page);
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
  let parentOfCells = page.locator('.run-through-section-cells');
  let cells = parentOfCells.locator('.run-through-code-result');
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

test.setTimeout(120000);
test('should work unfreeze below in section button and unfreeze below all button', async ({ page }) => {
  // create new notebook
  const fileName = "run_through_test.ipynb";
  await page.notebook.createNew(fileName);
  await page.waitForSelector(`[role="main"] >> text=${fileName}`);
  await waitForNotebookReady(page);
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
  
  //** Unfreeze section test */
  // Unfreeze and add text all cells
  const allCellIndexes = [1, 2, 3, 5, 6, 7];
  await page.notebook.selectCells(1, 1);
  await page.locator('.run-through-toolbar-button__unfreeze-all').click();
  for(let idx of allCellIndexes) {
    await page.notebook.setCell(idx, 'code', 'print("add1")\n');
    const locator = (await page.notebook.getCellLocator(idx))!.locator('span.fa-snowflake');
    await expect(locator).not.toBeVisible();
  }

  // freeze all cells
  for(let idx of allCellIndexes) {
    await page.notebook.selectCells(idx, idx);
    await delay(100);
    await page.locator('.run-through-toolbar-button__freeze').click();
    const locator = (await page.notebook.getCellLocator(idx))!.locator('span.fa-snowflake');
    await expect(locator).toBeVisible();
  }

  // copy 6th code and paste as 7th code
  await page.notebook.selectCells(7, 7);
  await page.locator('jp-button[data-command="notebook:copy-cell"]').click();
  await page.locator('jp-button[data-command="notebook:paste-cell-below"]').click();
  let locator = (await page.notebook.getCellLocator(7))!.locator('span.fa-snowflake');
  await expect(locator).toBeVisible();
  locator = (await page.notebook.getCellLocator(8))!.locator('span.fa-snowflake');
  await expect(locator).not.toBeVisible();

  // copy 7th code and paste as 8th code
  await page.notebook.selectCells(8, 8);
  await page.locator('jp-button[data-command="notebook:copy-cell"]').click();
  await page.locator('jp-button[data-command="notebook:paste-cell-below"]').click();
  locator = (await page.notebook.getCellLocator(8))!.locator('span.fa-snowflake');
  await expect(locator).not.toBeVisible();
  locator = (await page.notebook.getCellLocator(9))!.locator('span.fa-snowflake');
  await expect(locator).not.toBeVisible();

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

  //** Unfreeze all test */
  // Unfreeze and add text all cells
  await page.notebook.selectCells(1, 1);
  await page.locator('.run-through-toolbar-button__unfreeze-all').click();
  for(let idx of allCellIndexes) {
    await page.notebook.setCell(idx, 'code', 'print("add2")\n');
  }

  // freeze all cells
  for(let idx of allCellIndexes) {
    await page.notebook.selectCells(idx, idx);
    await delay(100);
    await page.locator('.run-through-toolbar-button__freeze').click();
  }

  // Unfreeze 2nd, 3rd, 4th, 5th, 6th codes
  await page.notebook.selectCells(2, 2);
  await delay(500);
  await page.locator('.run-through-toolbar-button__unfreeze-all').click();
  await page.notebook.runCellByCell();
  let output2_1 = await page.notebook.getCellTextOutput(1);
  expect(output2_1![0]).not.toContain('add2');
  let output2_2 = await page.notebook.getCellTextOutput(2);
  expect(output2_2![0]).toContain('add2');
  let output2_3 = await page.notebook.getCellTextOutput(3);
  expect(output2_3![0]).toContain('add2');
  let output2_4 = await page.notebook.getCellTextOutput(5);
  expect(output2_4![0]).toContain('add2');
  let output2_5 = await page.notebook.getCellTextOutput(6);
  expect(output2_5![0]).toContain('add2');
  let output2_6 = await page.notebook.getCellTextOutput(7);
  expect(output2_6![0]).toContain('add2');
});

test.setTimeout(120000);
test('should detect nested heading levels correctly', async ({ page }) => {
  // create new notebook
  const fileName = "nested_heading_test.ipynb";
  await page.notebook.createNew(fileName);
  await page.waitForSelector(`[role="main"] >> text=${fileName}`);
  await waitForNotebookReady(page);

  // Create nested heading structure
  // # Level 1
  await page.notebook.setCell(0, 'markdown', '# Level 1');
  // code cell 1
  await page.notebook.addCell('code', 'print("L1-1")');
  // ## Level 2
  await page.notebook.addCell('markdown', '## Level 2');
  // code cell 2
  await page.notebook.addCell('code', 'print("L2-1")');
  // ### Level 3
  await page.notebook.addCell('markdown', '### Level 3');
  // code cell 3
  await page.notebook.addCell('code', 'print("L3-1")');
  // ## Another Level 2
  await page.notebook.addCell('markdown', '## Another Level 2');
  // code cell 4
  await page.notebook.addCell('code', 'print("L2-2")');
  // # Another Level 1
  await page.notebook.addCell('markdown', '# Another Level 1');
  // code cell 5
  await page.notebook.addCell('code', 'print("L1-2")');

  // Run all cells
  await page.notebook.run();

  // Collapse Level 1 heading - should include all cells until next Level 1
  await page.notebook.selectCells(0, 0);
  const level1Cell = await page.notebook.getCellLocator(0);
  await level1Cell!.locator('.jp-InputArea-prompt').hover();
  await level1Cell!.locator('.jp-collapseHeadingButton').click();
  await delay(300);

  // Check that Level 1 section contains 4 code cells (indices 1, 3, 5, 7)
  const level1CodeCells = level1Cell!.locator('.run-through-code-result');
  await expect(level1CodeCells).toHaveCount(4);

  // Verify all are executed (success)
  await expect(level1CodeCells.nth(0)).toHaveClass(/run-through-code-result__success/);
  await expect(level1CodeCells.nth(1)).toHaveClass(/run-through-code-result__success/);
  await expect(level1CodeCells.nth(2)).toHaveClass(/run-through-code-result__success/);
  await expect(level1CodeCells.nth(3)).toHaveClass(/run-through-code-result__success/);

  // Expand Level 1
  await level1Cell!.locator('.jp-InputArea-prompt').hover();
  await level1Cell!.locator('.jp-collapseHeadingButton').click();
  await delay(300);

  // Collapse Level 2 heading - should include cells until next Level 2 or higher
  await page.notebook.selectCells(2, 2);
  const level2Cell = await page.notebook.getCellLocator(2);
  await level2Cell!.locator('.jp-InputArea-prompt').hover();
  await level2Cell!.locator('.jp-collapseHeadingButton').click();
  await delay(300);

  // Check that Level 2 section contains 2 code cells (indices 3, 5)
  const level2CodeCells = level2Cell!.locator('.run-through-code-result');
  await expect(level2CodeCells).toHaveCount(2);
});

test.setTimeout(120000);
test('should handle consecutive empty sections and last section with content', async ({ page }) => {
  // create new notebook
  const fileName = "empty_sections_test.ipynb";
  await page.notebook.createNew(fileName);
  await page.waitForSelector(`[role="main"] >> text=${fileName}`);
  await waitForNotebookReady(page);

  // Create 3 empty sections followed by 1 section with content
  await page.notebook.setCell(0, 'markdown', '# Empty Section 1');
  await page.notebook.addCell('markdown', '# Empty Section 2');
  await page.notebook.addCell('markdown', '# Empty Section 3');
  await page.notebook.addCell('markdown', '# Section with Content');
  await page.notebook.addCell('code', 'print("finally some code")');

  // Run all cells
  await page.notebook.run();

  // Test empty section 1
  await page.notebook.selectCells(0, 0);
  const section1Cell = await page.notebook.getCellLocator(0);
  await section1Cell!.locator('.jp-InputArea-prompt').hover();
  await section1Cell!.locator('.jp-collapseHeadingButton').click();
  await delay(300);

  const section1Cells = section1Cell!.locator('.run-through-code-result');
  await expect(section1Cells).toHaveCount(0);

  // Test empty section 2
  await page.notebook.selectCells(1, 1);
  const section2Cell = await page.notebook.getCellLocator(1);
  await section2Cell!.locator('.jp-InputArea-prompt').hover();
  await section2Cell!.locator('.jp-collapseHeadingButton').click();
  await delay(300);

  const section2Cells = section2Cell!.locator('.run-through-code-result');
  await expect(section2Cells).toHaveCount(0);

  // Test empty section 3
  await page.notebook.selectCells(2, 2);
  const section3Cell = await page.notebook.getCellLocator(2);
  await section3Cell!.locator('.jp-InputArea-prompt').hover();
  await section3Cell!.locator('.jp-collapseHeadingButton').click();
  await delay(300);

  const section3Cells = section3Cell!.locator('.run-through-code-result');
  await expect(section3Cells).toHaveCount(0);

  // Test last section with content
  await page.notebook.selectCells(3, 3);
  const section4Cell = await page.notebook.getCellLocator(3);
  await section4Cell!.locator('.jp-InputArea-prompt').hover();
  await section4Cell!.locator('.jp-collapseHeadingButton').click();
  await delay(300);

  const section4Cells = section4Cell!.locator('.run-through-code-result');
  await expect(section4Cells).toHaveCount(1);
  await expect(section4Cells.nth(0)).toHaveClass(/run-through-code-result__success/);
});

test.setTimeout(120000);
test('should persist frozen state in cell metadata', async ({ page, baseURL, tmpPath }) => {
  // create new notebook
  const fileName = "metadata_test.ipynb";
  await page.notebook.createNew(fileName);
  await page.waitForSelector(`[role="main"] >> text=${fileName}`);
  await waitForNotebookReady(page);

  // Create cells
  await page.notebook.setCell(0, 'code', 'print("cell 0")');
  await page.notebook.addCell('code', 'print("cell 1")');
  await page.notebook.addCell('code', 'print("cell 2")');

  // Run all cells - they will be automatically frozen after successful execution
  await page.notebook.run();
  await delay(500);

  // Save notebook
  await page.notebook.save();
  await delay(500);

  // Read notebook file and check metadata
  let response = await fetch(`${baseURL}/files/${tmpPath}/${fileName}`);
  let notebook = await response.json();

  // Check all cells are frozen after successful execution
  expect(notebook.cells[0].metadata.run_through_control).toEqual({
    frozen: true,
    read_only: false
  });
  expect(notebook.cells[1].metadata.run_through_control).toEqual({
    frozen: true,
    read_only: false
  });
  expect(notebook.cells[2].metadata.run_through_control).toEqual({
    frozen: true,
    read_only: false
  });

  // Unfreeze cell 1
  await page.notebook.selectCells(1, 1);
  await page.locator('.run-through-toolbar-button__unfreeze').click();
  await delay(300);

  // Save notebook again
  await page.notebook.save();
  await delay(500);

  // Read notebook file again and check metadata
  response = await fetch(`${baseURL}/files/${tmpPath}/${fileName}`);
  notebook = await response.json();

  // Check cell 1 metadata (unfrozen)
  expect(notebook.cells[1].metadata.run_through_control).toEqual({
    frozen: false,
    read_only: false
  });
});
