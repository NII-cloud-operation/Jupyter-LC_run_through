import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { ToolbarButton } from '@jupyterlab/apputils';
import { setCellState } from './cell-state-utils';
import {
  getCellsInBelowAll,
  getCellsInBelowSection,
  getSelectedOrActiveCells
} from './cell-selection-utils';

export class ToolbarExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  createNew(
    widget: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): void | IDisposable {
    const buttons = [
      new ToolbarButton({
        className: 'run-through-toolbar-button',
        iconClass: 'fas fa-lock',
        tooltip: 'make selected cells read-only',
        onClick() {
          getSelectedOrActiveCells(widget.content).forEach(cell => {
            setCellState(cell.model, { read_only: true });
          });
        }
      }),
      new ToolbarButton({
        className: 'run-through-toolbar-button',
        iconClass: 'fas fa-unlock',
        tooltip: 'make selected cells editable',
        onClick() {
          getSelectedOrActiveCells(widget.content).forEach(cell => {
            setCellState(cell.model, { read_only: false });
          });
        }
      }),
      new ToolbarButton({
        className:
          'run-through-toolbar-button run-through-toolbar-button__freeze',
        iconClass: 'far fa-snowflake',
        tooltip: 'freeze selected cells',
        onClick() {
          getSelectedOrActiveCells(widget.content).forEach(cell => {
            setCellState(cell.model, { frozen: true });
          });
        }
      }),
      new ToolbarButton({
        className:
          'run-through-toolbar-button run-through-toolbar-button__unfreeze',
        iconClass: 'far fa-snowflake',
        tooltip: 'unfreeze selected cells',
        onClick() {
          getSelectedOrActiveCells(widget.content).forEach(cell => {
            setCellState(cell.model, { frozen: false });
          });
        }
      }),
      new ToolbarButton({
        className:
          'run-through-toolbar-button run-through-toolbar-button__unfreeze-section fas',
        iconClass: 'far fa-snowflake',
        tooltip: 'unfreeze below in section',
        onClick() {
          getCellsInBelowSection(widget.content).forEach(cell => {
            setCellState(cell.model, { frozen: false });
          });
        }
      }),
      new ToolbarButton({
        className:
          'run-through-toolbar-button run-through-toolbar-button__unfreeze-all fas',
        iconClass: 'far fa-snowflake',
        tooltip: 'unfreeze below all',
        onClick() {
          getCellsInBelowAll(widget.content).forEach(cell => {
            setCellState(cell.model, { frozen: false });
          });
        }
      })
    ];
    buttons.reverse();
    buttons.forEach((b, i) => {
      widget.toolbar.insertItem(10, `run-through-button ${i}`, b);
    });

    return new DisposableDelegate(() => {
      buttons.forEach(b => {
        b.dispose();
      });
    });
  }
}
