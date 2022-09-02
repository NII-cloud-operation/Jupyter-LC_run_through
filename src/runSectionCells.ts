import { ISessionContext } from '@jupyterlab/apputils';
import { MarkdownCell, isCodeCellModel, CodeCell } from '@jupyterlab/cells';
import { Notebook } from '@jupyterlab/notebook';
import { IExecuteReplyMsg } from '@jupyterlab/services/lib/kernel/messages';
import { getSectionCells } from './getSectionCells';

export function runSectionCells(
  cell: MarkdownCell,
  notebook: Notebook,
  sessionContext: ISessionContext
): Promise<(void | IExecuteReplyMsg)[]> {
  // 順番通りに実行されるか少し不安だけど、試した限りでは問題なかった

  return Promise.all(
    getSectionCells(cell, notebook)
      .filter(c => isCodeCellModel(c.model))
      .map(c => CodeCell.execute(c as CodeCell, sessionContext))
  );
}
