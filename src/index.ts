import { INotebookTracker } from '@jupyterlab/notebook';
import { ExecutionExtension } from './ExecutionExtension';
import { CellExtension } from './CellExtension';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ToolbarExtension } from './ToolbarExtension';
import { pluginId, extensionId } from './plugin';
import { registerCommands } from './commands';
import { ICommandPalette } from '@jupyterlab/apputils';

/**
 * Initialization data for the lc_run_through extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: pluginId,
  autoStart: true,
  requires: [INotebookTracker, ICommandPalette],
  activate: (
    app: JupyterFrontEnd,
    notebooks: INotebookTracker,
    commandPalette: ICommandPalette
  ) => {
    console.debug('JupyterLab extension ' + extensionId + ' is activated!');

    app.docRegistry.addWidgetExtension('Notebook', new ExecutionExtension());
    app.docRegistry.addWidgetExtension('Notebook', new CellExtension());
    app.docRegistry.addWidgetExtension('Notebook', new ToolbarExtension());

    registerCommands(app, notebooks, commandPalette);
  }
};

export default plugin;
