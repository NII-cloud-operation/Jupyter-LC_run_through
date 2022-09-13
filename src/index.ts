import { ExecutionExtension } from './ExecutionExtension';
import { CellExtension } from './CellExtension';
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
    console.debug('JupyterLab extension lc_run_through is activated!');

    app.docRegistry.addWidgetExtension('Notebook', new ExecutionExtension());
    app.docRegistry.addWidgetExtension('Notebook', new CellExtension());
    app.docRegistry.addWidgetExtension('Notebook', new ToolbarExtension());
  }
};

export default plugin;
