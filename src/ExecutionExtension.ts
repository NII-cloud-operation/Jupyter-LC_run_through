import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IDisposable } from '@lumino/disposable';
import { CodeCell, CodeCellModel } from '@jupyterlab/cells';
import { ISessionContext } from '@jupyterlab/apputils';
import { JSONObject } from '@lumino/coreutils';
import { KernelMessage } from '@jupyterlab/services';
import { getCellState, setCellState } from './cell-state-utils';

export class ExecutionExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  createNew(): void | IDisposable {
    patchCodeCellModelClearExecution();
    patchCodeCellExecute();
  }
}

/**
 * CodeCell.executeを拡張する
 */
function patchCodeCellExecute(): void {
  const oldFunction = CodeCell.execute;
  CodeCell.execute = function (
    cell: CodeCell,
    sessionContext: ISessionContext,
    metadata?: JSONObject | undefined
  ): Promise<void | KernelMessage.IExecuteReplyMsg> {
    // 「凍結」されていたら実行しない
    if (getCellState(cell.model).frozen) {
      return Promise.resolve();
    }
    setCellState(cell.model, { frozen: true });
    return oldFunction(cell, sessionContext, metadata);
  };
}

/**
 * CodeCellModel.prototype.clearExecutionを拡張する
 */
function patchCodeCellModelClearExecution(): void {
  const oldFunction = CodeCellModel.prototype.clearExecution;
  CodeCellModel.prototype.clearExecution = function (): void {
    // 「凍結」されていたら実行しない
    if (getCellState(this).frozen) {
      return;
    }
    return oldFunction.bind(this)();
  };
}
