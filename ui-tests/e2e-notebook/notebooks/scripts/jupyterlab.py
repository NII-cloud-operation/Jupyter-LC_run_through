"""JupyterLab utility helpers.

Helper functions for common JupyterLab operations in e2e tests.
"""

from playwright.async_api import Page, Locator, expect
import re


async def get_active_panel(
    page: Page,
    timeout: int = 30000
) -> Locator:
    """Get the active panel in JupyterLab.

    Finds the active tab and returns the corresponding panel element.

    Args:
        page: Playwright page object
        timeout: Timeout in milliseconds

    Returns:
        Playwright Locator for the active panel element
    """
    # Get the tab container
    tab_container = page.locator('.lm-Widget.lm-TabBar.lm-DockPanel-tabBar')
    await expect(tab_container).to_be_visible(timeout=timeout)

    # Get the active tab
    active_tab = tab_container.locator('.lm-TabBar-tab.lm-mod-current')
    await expect(active_tab).to_be_visible(timeout=timeout)

    # Get the tab's data-id attribute
    tab_id = await active_tab.get_attribute('data-id')

    # Find and return the panel with matching id
    active_panel = page.locator(f'div.jp-Activity.lm-DockPanel-widget[id="{tab_id}"]')
    return active_panel


async def create_new_notebook(
    page: Page,
    timeout: int = 30000
):
    """Create a new notebook from JupyterLab using File > New > Notebook menu.

    Assumes page is already on the JupyterLab main page.

    Args:
        page: Playwright page object (must be on JupyterLab page)
        timeout: Timeout in milliseconds

    Returns:
        The same page object (notebook opens in same tab in JupyterLab)
    """
    # Click File menu
    file_menu = page.locator('.lm-MenuBar-itemLabel').filter(has_text=re.compile(r'^File$'))
    await expect(file_menu).to_be_visible(timeout=timeout)
    await file_menu.click()

    # Wait for dropdown menu to appear
    dropdown_menu = page.locator('.lm-Menu.lm-MenuBar-menu')
    await expect(dropdown_menu).to_be_visible(timeout=timeout)

    # Hover over "New" menu item to open submenu
    new_menu_item = dropdown_menu.locator('.lm-Menu-item').filter(has_text=re.compile(r'^New$'))
    await expect(new_menu_item).to_be_visible(timeout=timeout)
    await new_menu_item.hover()

    # Wait for submenu to appear and click "Notebook"
    submenu = page.locator('.lm-Menu[id="jp-mainmenu-file-new"]')
    await expect(submenu).to_be_visible(timeout=timeout)
    notebook_item = submenu.locator('.lm-Menu-item').filter(has_text='Notebook')
    await expect(notebook_item).to_be_visible(timeout=timeout)
    await notebook_item.click()

    # Wait for kernel selection dialog to appear
    kernel_dialog = page.locator('.jp-Dialog')
    await expect(kernel_dialog).to_be_visible(timeout=timeout)

    # Click the "Select" button in the dialog
    select_button = kernel_dialog.locator('button.jp-mod-accept')
    await expect(select_button).to_be_visible(timeout=timeout)
    await select_button.click()

    # Wait for the active notebook panel to have cells
    active_panel = await get_active_panel(page, timeout)
    await expect(active_panel.locator('.jp-Cell.jp-CodeCell')).to_be_visible(timeout=timeout)

    return page


async def set_cell_type(
    page: Page,
    index: int,
    cell_type: str,
    timeout: int = 30000
):
    """Change the type of a cell at the specified index.

    Args:
        page: Playwright page object
        index: Cell index (0-based)
        cell_type: Cell type ("code" or "markdown")
        timeout: Timeout in milliseconds
    """
    # Get and select the cell
    cell = await get_cell(page, index, timeout)
    await select_cell(page, index, timeout)

    # Check current cell type
    class_name = await cell.get_attribute('class')
    current_cell_type = "code" if 'jp-CodeCell' in class_name else "markdown"

    # Not change if cell type is same
    if current_cell_type == cell_type:
        return

    # Click cell type toolbar item
    panel = await get_active_panel(page, timeout)
    cell_type_toolbar_item = panel.locator('.jp-Toolbar-item.jp-Notebook-toolbarCellType')
    await cell_type_toolbar_item.click()

    # Change cell type
    select_input = panel.locator('div.jp-Notebook-toolbarCellTypeDropdown select')
    await expect(select_input).to_be_visible(timeout=timeout)
    await select_input.select_option(cell_type)


async def set_cell(
    page: Page,
    index: int,
    cell_type: str,
    content: str,
    timeout: int = 30000
):
    """Set the content of a cell at the specified index.

    Args:
        page: Playwright page object
        index: Cell index (0-based)
        cell_type: Cell type ("code" or "markdown")
        content: Content to set in the cell
        timeout: Timeout in milliseconds
    """
    # Get the cell
    cell = await get_cell(page, index, timeout)

    # Change cell type if needed
    await set_cell_type(page, index, cell_type, timeout)

    # Click the editor to focus it
    editor = cell.locator('.jp-Cell-inputArea')
    if cell_type == 'markdown':
        await editor.dblclick()
    await editor.click()

    # Clear existing content
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.press('Backspace')

    # Type new content
    # give CodeMirror time to style properly
    await page.keyboard.type(content, delay=100 if cell_type == 'code' else 0)

    # give CodeMirror time to style properly
    if cell_type == 'code':
        await page.wait_for_timeout(500)


async def run_cell(
    page: Page,
    index: int,
    wait_for_output: bool = True,
    timeout: int = 30000
):
    """Execute a cell at the specified index.

    Args:
        page: Playwright page object
        index: Cell index (0-based)
        wait_for_output: Wait for cell execution to complete (default: True)
        timeout: Timeout in milliseconds
    """
    # Get and select the cell
    cell = await get_cell(page, index, timeout)
    await select_cell(page, index, timeout)

    # Execute using Shift+Enter
    await page.keyboard.press('Shift+Enter')

    # Wait for execution to complete if requested
    if wait_for_output:
        # Wait for the cell to finish executing
        # The prompt changes from [*] (executing) to [n] (completed)
        prompt = cell.locator('.jp-InputArea-prompt')
        # Wait until the prompt doesn't contain [*]
        await expect(prompt).not_to_contain_text('[*]', timeout=timeout)


async def get_cell(
    page: Page,
    index: int,
    timeout: int = 30000
) -> Locator:
    """Get the cell element at the specified index.

    Args:
        page: Playwright page object
        index: Cell index (0-based)
        timeout: Timeout in milliseconds

    Returns:
        Playwright Locator for the cell element
    """
    panel = await get_active_panel(page, timeout)
    cells = panel.locator('.jp-Cell')
    cell = cells.nth(index)
    await expect(cell).to_be_visible(timeout=timeout)
    return cell


async def select_cell(
    page: Page,
    index: int,
    timeout: int = 30000
):
    """Select a cell at the specified index.

    Args:
        page: Playwright page object
        index: Cell index (0-based)
        timeout: Timeout in milliseconds
    """
    cell = await get_cell(page, index, timeout)
    await cell.click()


async def add_cell(
    page: Page,
    cell_type: str,
    content: str,
    timeout: int = 30000
) -> int:
    """Add a new cell at the end of the notebook.

    Selects the last cell and clicks the insert button in the toolbar.

    Args:
        page: Playwright page object
        cell_type: Cell type ("code" or "markdown")
        content: Cell content
        timeout: Timeout in milliseconds

    Returns:
        The index of the newly added cell
    """
    # Get all cells in the active panel and select the last one
    panel = await get_active_panel(page, timeout)
    cells = panel.locator('.jp-Cell')
    cell_count = await cells.count()

    if cell_count > 0:
        # Select the last cell
        await select_cell(page, cell_count - 1, timeout)

    # Click the insert button in the toolbar
    insert_button = panel.locator('.jp-Toolbar-item[data-jp-item-name="insert"]')
    await expect(insert_button).to_be_visible(timeout=timeout)
    await insert_button.click()

    # Wait for the new cell to be added
    new_cell_count = cell_count + 1
    await expect(cells).to_have_count(new_cell_count, timeout=timeout)

    # Set the cell type and content
    new_cell_index = new_cell_count - 1
    await set_cell(page, new_cell_index, cell_type, content, timeout)

    return new_cell_index


async def rename_notebook(
    page: Page,
    new_name: str,
    timeout: int = 30000
):
    """Rename the current notebook.

    Uses File > Rename Notebook... menu to rename the notebook.

    Args:
        page: Playwright page object
        new_name: New name for the notebook (without .ipynb extension)
        timeout: Timeout in milliseconds
    """
    # Click the "File" menu in the menu bar
    file_menu = page.locator('.lm-MenuBar-itemLabel').filter(has_text=re.compile(r'^File$'))
    await expect(file_menu).to_be_visible(timeout=timeout)
    await file_menu.click()

    # Click "Rename Notebook..." in the dropdown menu
    dropdown_menu = page.locator('.lm-Menu.lm-MenuBar-menu')
    await expect(dropdown_menu).to_be_visible(timeout=timeout)
    rename_item = dropdown_menu.locator('.lm-Menu-item[data-command="docmanager:rename"]')
    await expect(rename_item).to_be_visible(timeout=timeout)
    await rename_item.click()

    # Wait for the rename dialog to appear and fill the input
    rename_input = page.locator('.jp-Dialog input')
    await expect(rename_input).to_be_visible(timeout=timeout)
    await rename_input.fill(new_name)

    # Click the Rename button in the dialog
    rename_button = page.locator('.jp-Dialog-button.jp-mod-accept')
    await expect(rename_button).to_be_visible(timeout=timeout)
    await rename_button.click()

    # Wait for the rename to complete
    await page.wait_for_timeout(500)


async def save_notebook(
    page: Page,
):
    """Save the current notebook.

    Uses keyboard shortcut Ctrl+S (or Cmd+S on Mac) to save.

    Args:
        page: Playwright page object
    """
    # Use keyboard shortcut to save
    await page.keyboard.press('ControlOrMeta+S')

    # Wait for save to complete
    await page.wait_for_timeout(1000)


async def delete_file(
    page: Page,
    filename: str,
    timeout: int = 30000
) -> bool:
    """Delete a file from the Jupyter file browser.

    Right-clicks on the file and selects Delete from the context menu.
    Assumes page is on the tree page (/tree).

    Args:
        page: Playwright page object (must be on /tree page)
        filename: Name of the file to delete
        timeout: Timeout in milliseconds

    Returns:
        True if file was deleted, False if file was not found
    """
    # Find the file in the file browser (title starts with "Name: {filename}")
    file_item = page.locator(f'.jp-DirListing-item[data-file-type="notebook"][title^="Name: {filename}"]')

    # Check if file exists
    if await file_item.count() == 0:
        return False

    # Right-click on the file to open context menu
    await file_item.click(button='right')

    # Click "Delete" in the context menu
    context_menu = page.locator('.lm-Widget.lm-Menu')
    await expect(context_menu).to_be_visible(timeout=timeout)
    delete_item = context_menu.locator('.lm-Menu-item[data-command="filebrowser:delete"]')
    await expect(delete_item).to_be_visible(timeout=timeout)
    await delete_item.click()

    # Confirm deletion in the dialog
    delete_button = page.locator('.jp-Dialog-button.jp-mod-accept')
    await expect(delete_button).to_be_visible(timeout=timeout)
    await delete_button.click()

    # Wait for the file to be removed from the list
    await expect(file_item).to_have_count(0, timeout=timeout)

    return True


__all__ = [
    "get_active_panel",
    "create_new_notebook",
    "set_cell_type",
    "set_cell",
    "run_cell",
    "get_cell",
    "select_cell",
    "add_cell",
    "rename_notebook",
    "save_notebook",
    "delete_file",
]
