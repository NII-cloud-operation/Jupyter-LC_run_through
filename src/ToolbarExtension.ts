import { INotebookModel, Notebook, NotebookPanel } from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { ToolbarButton } from '@jupyterlab/apputils';
import {
  Cell,
  ICellModel,
  isMarkdownCellModel,
  MarkdownCell
} from '@jupyterlab/cells';
import { getSectionCells } from './getSectionCells';
import { setCellState } from './cell-state-utils';

export class ToolbarExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  createNew(
    widget: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): void | IDisposable {
    const buttons = [
      new ToolbarButton({
        className: 'fa fa-lock',
        label: 'L1',
        tooltip: 'make selected cells read-only',
        onClick() {
          getSelectedOrActiveCells(widget.content).forEach(cell => {
            setCellState(cell.model, { read_only: true });
          });
        }
      }),
      new ToolbarButton({
        className: 'fa fa-unlock-alt',
        label: 'UL1',
        tooltip: 'make selected cells editable',
        onClick() {
          getSelectedOrActiveCells(widget.content).forEach(cell => {
            setCellState(cell.model, { read_only: false });
          });
        }
      }),
      new ToolbarButton({
        className: 'fa fa-freeze',
        label: 'F1',
        tooltip: 'freeze selected cells',
        onClick() {
          getSelectedOrActiveCells(widget.content).forEach(cell => {
            setCellState(cell.model, { frozen: true });
          });
        }
      }),
      new ToolbarButton({
        className: 'fa fa-unfreeze',
        label: 'UF1',
        tooltip: 'unfreeze selected cells',
        onClick() {
          getSelectedOrActiveCells(widget.content).forEach(cell => {
            setCellState(cell.model, { frozen: false });
          });
        }
      }),
      new ToolbarButton({
        className: 'fa fa-unfreeze-below-in-section',
        label: 'UF2',
        tooltip: 'unfreeze below in section',
        onClick() {
          getCellsInBelowSection(widget.content).forEach(cell => {
            setCellState(cell.model, { frozen: false });
          });
        }
      }),
      new ToolbarButton({
        className: 'fa fa-unfreeze-all',
        label: 'UF3',
        tooltip: 'unfreeze below all',
        onClick() {
          getCellsInBelowAll(widget.content).forEach(cell => {
            setCellState(cell.model, { frozen: false });
          });
        }
      })
    ];
    buttons.forEach((b, i) => {
      widget.toolbar.insertItem(10 + i, `run-through-button ${i}`, b);
    });

    return new DisposableDelegate(() => {
      buttons.forEach(b => {
        b.dispose();
      });
    });
  }
}

/**
 * 選択したセルを取得する
 */
function getSelectedOrActiveCells(notebook: Notebook) {
  return notebook.widgets.filter(cell => notebook.isSelectedOrActive(cell));
}

/**
 * 選択した位置のセクションのセルを取得する
 */
function getCellsInBelowSection(notebook: Notebook) {
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
function getCellsInBelowAll(notebook: Notebook): Cell<ICellModel>[] {
  const index = notebook.activeCellIndex;
  const cells = [...notebook.widgets];
  cells.splice(0, index);
  return cells;
}
