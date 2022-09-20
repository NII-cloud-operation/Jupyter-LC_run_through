import { extensionId } from './plugin';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { CommandRegistry } from '@lumino/commands';
import {
  getCellsInBelowAll,
  getCellsInBelowSection,
  getSelectedOrActiveCells
} from './cell-selection-utils';
import { setCellState } from './cell-state-utils';

interface ICommand {
  id: string;
  options: CommandRegistry.ICommandOptions;
}

/**
 * コマンドを作成する
 */
export function createCommands(
  app: JupyterFrontEnd,
  notebooks: INotebookTracker
): ICommand[] {
  return [
    {
      id: 'run-through-lock',
      options: {
        label: 'make selected cells read-only',
        caption: 'make selected cells read-only',
        execute() {
          const widget = getCurrentNotebookPanel(app, notebooks);
          if (widget) {
            getSelectedOrActiveCells(widget.content).forEach(cell => {
              setCellState(cell.model, { read_only: true });
            });
          }
        }
      }
    },
    {
      id: 'run-through-unlock',
      options: {
        label: 'make selected cells editable',
        caption: 'make selected cells editable',
        execute() {
          const widget = getCurrentNotebookPanel(app, notebooks);
          if (widget) {
            getSelectedOrActiveCells(widget.content).forEach(cell => {
              setCellState(cell.model, { read_only: false });
            });
          }
        }
      }
    },
    {
      id: 'run-through-freeze',
      options: {
        label: 'freeze selected cells',
        caption: 'freeze selected cells',
        execute() {
          const widget = getCurrentNotebookPanel(app, notebooks);
          if (widget) {
            getSelectedOrActiveCells(widget.content).forEach(cell => {
              setCellState(cell.model, { frozen: true });
            });
          }
        }
      }
    },
    {
      id: 'run-through-unfreeze',
      options: {
        label: 'unfreeze selected cells',
        caption: 'unfreeze selected cells',
        execute() {
          const widget = getCurrentNotebookPanel(app, notebooks);
          if (widget) {
            getSelectedOrActiveCells(widget.content).forEach(cell => {
              setCellState(cell.model, { frozen: false });
            });
          }
        }
      }
    },
    {
      id: 'run-through-unfreeze-section',
      options: {
        label: 'unfreeze below in section',
        caption: 'unfreeze below in section',
        execute() {
          const widget = getCurrentNotebookPanel(app, notebooks);
          if (widget) {
            getCellsInBelowSection(widget.content).forEach(cell => {
              setCellState(cell.model, { frozen: false });
            });
          }
        }
      }
    },
    {
      id: 'run-through-unfreeze-all',
      options: {
        label: 'unfreeze below all',
        caption: 'unfreeze below all',
        execute() {
          const widget = getCurrentNotebookPanel(app, notebooks);
          if (widget) {
            getCellsInBelowAll(widget.content).forEach(cell => {
              setCellState(cell.model, { frozen: false });
            });
          }
        }
      }
    }
  ];
}

/**
 * コマンドパレットにコマンドを登録する
 */
export function registerCommands(
  app: JupyterFrontEnd,
  notebooks: INotebookTracker,
  commandPalette: ICommandPalette
): void {
  createCommands(app, notebooks).forEach(({ id, options }) => {
    const command = extensionId + ':' + id;
    app.commands.addCommand(command, options);
    commandPalette.addItem({ command, category: 'Notebook' });
  });
}

function getCurrentNotebookPanel(
  app: JupyterFrontEnd,
  notebooks: INotebookTracker
) {
  return notebooks.find(
    panel =>
      !!app.shell.currentWidget && panel.id === app.shell.currentWidget.id
  );
}
