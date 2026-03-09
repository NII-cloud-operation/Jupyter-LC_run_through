import { ISessionContext } from '@jupyterlab/apputils';
import { MarkdownCell, isCodeCellModel } from '@jupyterlab/cells';
import { Notebook, NotebookActions } from '@jupyterlab/notebook';
import { getSectionCells } from './cell-selection-utils';

export function runSectionCells(
  cell: MarkdownCell,
  notebook: Notebook,
  sessionContext: ISessionContext
): Promise<boolean> {
  // Use NotebookActions.runCells to trigger NotebookActions.executed signal,
  // which is required for multi_outputs extension compatibility.
  const cells = getSectionCells(cell, notebook).filter(c =>
    isCodeCellModel(c.model)
  );
  return NotebookActions.runCells(notebook, cells, sessionContext);
}
