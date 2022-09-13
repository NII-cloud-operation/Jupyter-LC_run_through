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
  MarkdownCellModel,
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
      if (['add', 'set'].includes(args.type)) {
        args.newValues.forEach(c =>
          onCellAdded(c, widget.content, context.sessionContext)
        );
      }
    });
  }
}

function onCellAdded(
  cell: ICellModel,
  notebook: Notebook,
  sessionContext: ISessionContext
) {
  if (isMarkdownCellModel(cell)) {
    onMarkdownCellAdded(cell as MarkdownCellModel, notebook, sessionContext);
  }
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
    // collapse/expandに合わせて表示・非表示を切り替える

    if (NotebookActions.getHeadingInfo(cell).collapsed) {
      // そのまま実行するとうまく動かないから無理やり動かしてるけど、安定しないかも
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
