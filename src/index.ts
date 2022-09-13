import { CellExtension } from './CellExtension';
import { ButtonExtension } from './ButtonExtension';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ToolbarExtension } from './ToolbarExtension';
// import { CodeCell } from '@jupyterlab/cells';
// import { ISessionContext } from '@jupyterlab/apputils';
// import { JSONObject } from '@lumino/coreutils';
// import { KernelMessage } from '@jupyterlab/services';

/**
 * Initialization data for the lc_run_through extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'lc_run_through:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension lc_run_through is activated!');

    // const oldFunction = CodeCell.execute;
    // CodeCell.execute = function (
    //   cell: CodeCell,
    //   sessionContext: ISessionContext,
    //   metadata?: JSONObject | undefined
    // ): Promise<void | KernelMessage.IExecuteReplyMsg> {
    //   console.log('patch test');
    //   return oldFunction(cell, sessionContext, metadata);
    // };

    // NotebookActions.executed は CodeCell.execute の時に発火しない
    // NotebookActions.executed.connect((_, { cell, error }) => {
    //   console.log(
    //     'cell executed:',
    //     cell,
    //     error,
    //     NotebookActions.getHeadingInfo(cell)
    //   );
    // });

    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
    app.docRegistry.addWidgetExtension('Notebook', new CellExtension());
    app.docRegistry.addWidgetExtension('Notebook', new ToolbarExtension());
  }
};

export default plugin;
