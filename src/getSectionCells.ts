import { Cell, ICellModel, MarkdownCell } from '@jupyterlab/cells';
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
