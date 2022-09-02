import { ISessionContext } from '@jupyterlab/apputils';
import {
  INotebookModel,
  Notebook,
  NotebookActions,
  NotebookPanel
} from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IDisposable } from '@lumino/disposable';
import {
  isMarkdownCellModel,
  isCodeCellModel,
  MarkdownCellModel,
  CodeCellModel,
  ICellModel,
  MarkdownCell
} from '@jupyterlab/cells';
import { Widget } from '@lumino/widgets';
import { SectionSummaryWidget } from './SectionSummaryWidget';

export class CellExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  createNew(
    widget: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): void | IDisposable {
    widget.content.model?.cells.changed.connect((_, args) => {
      console.log('cell changed', args);

      if (['add', 'set'].includes(args.type)) {
        args.newValues.forEach(c =>
          onCellAdded(c, widget.content, context.sessionContext)
        );
      }
    });

    context.sessionContext.statusChanged.connect((_, args) => {
      // セルの実行時にbusy、実行終了時にidleに切り替わるが、どのセルかはわからない
      console.log('session status changed', args);
    });
  }
}

function onCellAdded(
  cell: ICellModel,
  notebook: Notebook,
  sessionContext: ISessionContext
) {
  if (isCodeCellModel(cell)) {
    onCodeCellAdded(cell as CodeCellModel, notebook);
  } else if (isMarkdownCellModel(cell)) {
    onMarkdownCellAdded(cell as MarkdownCellModel, notebook, sessionContext);
  }
}

function onCodeCellAdded(cell: CodeCellModel, notebook: Notebook) {
  cell.stateChanged.connect((_, change) => {
    if (change.name === 'executionCount' && change.newValue === null) {
      console.log('output cleared');
    }
  });
}

const memo = {} as Record<string, Widget>;

function onMarkdownCellAdded(
  cellModel: MarkdownCellModel,
  notebook: Notebook,
  sessionContext: ISessionContext
) {
  const cell = notebook.widgets.find(c => c.model.id === cellModel.id) as
    | MarkdownCell
    | undefined;
  if (cell) {
    if (NotebookActions.getHeadingInfo(cell).collapsed) {
      // FIXME そのまま実行するとうまく動かないから無理やり動かしてるけど、安定しないかも
      setTimeout(() => {
        memo[cell.model.id] = new SectionSummaryWidget(
          cell,
          notebook,
          sessionContext
        );
        Widget.attach(memo[cell.model.id], cell.node);
      }, 0);
    }

    cellModel.metadata.changed.connect((_, args) => {
      if (args.key === 'jp-MarkdownHeadingCollapsed') {
        console.log('toggle collapsed', args);
        if (args.type === 'add') {
          memo[cell.model.id] = new SectionSummaryWidget(
            cell,
            notebook,
            sessionContext
          );
          Widget.attach(memo[cell.model.id], cell.node);
        } else if (memo[cell.model.id]) {
          Widget.detach(memo[cell.model.id]);
          delete memo[cell.model.id];
        }
      }
    });
  }
}
