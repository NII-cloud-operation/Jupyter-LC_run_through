import { ISessionContext, ReactWidget, UseSignal } from '@jupyterlab/apputils';
import {
  CodeCell,
  isCodeCellModel,
  isMarkdownCellModel,
  MarkdownCell
} from '@jupyterlab/cells';
import { Notebook } from '@jupyterlab/notebook';
import React from 'react';
import { getCellState } from './cell-state-utils';
import { ExecutionResult, getExecutionStatus } from './ExecutionResultWidget';
import { getSectionCells } from './cell-selection-utils';
import { SectionRunButton } from './SectionRunButton';

export class SectionSummaryWidget extends ReactWidget {
  constructor(
    private cell: MarkdownCell,
    private notebook: Notebook,
    private sessionContext: ISessionContext
  ) {
    super();

    this.addClass('lc-SectionSummaryWidget');
  }

  render(): JSX.Element {
    const sectionCells = getSectionCells(this.cell, this.notebook).map(cell => {
      if (isCodeCellModel(cell.model)) {
        return (
          <UseSignal key={cell.model.id} signal={cell.model.stateChanged}>
            {() => (
              <UseSignal signal={cell.model.metadataChanged}>
                {() => (
                  <ExecutionResult
                    status={getExecutionStatus(cell as CodeCell)}
                    frozen={getCellState(cell.model).frozen}
                  />
                )}
              </UseSignal>
            )}
          </UseSignal>
        );
      } else if (isMarkdownCellModel(cell.model)) {
        const markdownElement = (cell as MarkdownCell).node.querySelector(
          '.jp-MarkdownOutput'
        );
        const header = markdownElement?.querySelector('h1, h2, h3, h4, h5, h6');
        if (header) {
          const __html = header?.innerHTML ?? '';
          return (
            <span
              key={cell.model.id}
              className="run-through-heading-result"
              dangerouslySetInnerHTML={{ __html }}
            ></span>
          );
        } else {
          return <span></span>;
        }
      }
      // else {
      //   return (
      //     <span key={cell.model.id} className="run-through-text-result">
      //       {cell.inputArea.model.value.text}
      //     </span>
      //   );
      // }
    });
    return (
      <div>
        <div>
          <SectionRunButton
            cell={this.cell}
            notebook={this.notebook}
            sessionContext={this.sessionContext}
          />
        </div>
        <div className="run-through-section-cells">{sectionCells}</div>
      </div>
    );
  }
}
