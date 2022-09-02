import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { ToolbarButton } from '@jupyterlab/apputils';

export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  createNew(
    widget: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): void | IDisposable {
    widget.content.model?.metadata.changed.connect(metadata => {
      console.log('notebook metadata changed', metadata);
    });
    widget.content.activeCellChanged.connect(() => {
      console.log(
        'notebook metadata',
        widget.content.model?.metadata.get('example')
      );
      widget.content.model?.metadata.set('example', new Date().toISOString());
    });

    const btn = new ToolbarButton({
      className: 'lc-ButtonExample',
      label: 'Label',
      tooltip: 'Tooltip',
      onClick() {
        console.log('Hello World');
      }
    });
    widget.toolbar.insertItem(10, 'example', btn);

    return new DisposableDelegate(() => {
      btn.dispose();
    });
  }
}
