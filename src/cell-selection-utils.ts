import {
  Cell,
  ICellModel,
  isMarkdownCellModel,
  MarkdownCell
} from '@jupyterlab/cells';
import { Notebook, NotebookActions } from '@jupyterlab/notebook';
import { findIndex } from '@lumino/algorithm';

export function getSectionCells(
  cell: Cell<ICellModel>,
  notebook: Notebook
): Cell<ICellModel>[] {
  const which = findIndex(notebook.widgets, (possibleCell, index) => {
    return cell.model.id === possibleCell.model.id;
  });
  if (which === -1) {
    return [];
  }
  if (!notebook.widgets.length) {
    return [];
  }
  const selectedHeadingInfo = NotebookActions.getHeadingInfo(cell);
  if (
    cell.isHidden ||
    !(cell instanceof MarkdownCell) ||
    !selectedHeadingInfo.isHeading
  ) {
    return [];
  }
  // iterate through all cells after the active cell.
  let cellNum;
  const cells = [] as Cell<ICellModel>[];
  for (cellNum = which + 1; cellNum < notebook.widgets.length; cellNum++) {
    const subCell = notebook.widgets[cellNum];
    const subCellHeadingInfo = NotebookActions.getHeadingInfo(subCell);
    if (
      subCellHeadingInfo.isHeading &&
      subCellHeadingInfo.headingLevel <= selectedHeadingInfo.headingLevel
    ) {
      // then reached an equivalent or higher heading level than the
      // original the end of the collapse.
      cellNum -= 1;
      break;
    }
    cells.push(subCell);
  }
  return cells;
}

/**
 * 選択したセルを取得する
 */
export function getSelectedOrActiveCells(
  notebook: Notebook
): Cell<ICellModel>[] {
  return notebook.widgets.filter(cell => notebook.isSelectedOrActive(cell));
}

/**
 * 選択した位置のセクションのセルを取得する
 */
export function getCellsInBelowSection(notebook: Notebook): Cell<ICellModel>[] {
  const index = notebook.activeCellIndex;
  const cells = notebook.widgets;

  const headingCell = findHeadingCell(cells[index], notebook);
  let section;
  if (headingCell) {
    section = getSectionCells(headingCell, notebook);
    section.splice(0, 0, headingCell);
  } else {
    section = [];
    const level = getCellLevel(cells[index]);
    for (let i = index; i < cells.length; ++i) {
      if (getCellLevel(cells[i]) !== level) {
        break;
      }
      section.push(cells[i]);
    }
  }

  const sectionCells = [];
  const index_in_section = section.findIndex(
    cell => cell.id === cells[index].id
  );

  for (let i = index_in_section; i < section.length; ++i) {
    sectionCells.push(section[i]);
  }

  return sectionCells;
}

function findHeadingCell(cell: Cell<ICellModel>, notebook: Notebook) {
  if (isCellHeading(cell)) {
    return cell;
  }

  const cells = notebook.widgets;
  const index = notebook.activeCellIndex;
  if (index === 0) {
    return null;
  }
  for (let i = index - 1; i >= 0; --i) {
    if (isCellHeading(cells[i])) {
      return cells[i];
    }
  }
  return null;
}

function isCellHeading(cell: Cell<ICellModel>): boolean {
  return getCellLevel(cell) < 7;
}

function getCellLevel(cell: Cell<ICellModel>): number {
  if (isMarkdownCellModel(cell.model)) {
    return (cell as MarkdownCell).headingInfo.level;
  }
  return 7;
}

/**
 * 選択した位置より下にあるセルを取得する
 */
export function getCellsInBelowAll(notebook: Notebook): Cell<ICellModel>[] {
  const index = notebook.activeCellIndex;
  const cells = [...notebook.widgets];
  cells.splice(0, index);
  return cells;
}
