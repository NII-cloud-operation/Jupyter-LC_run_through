import { ISessionContext, ReactWidget, UseSignal } from '@jupyterlab/apputils';
import {
  CodeCell,
  isCodeCellModel,
  isMarkdownCellModel,
  MarkdownCell
} from '@jupyterlab/cells';
import { Notebook } from '@jupyterlab/notebook';
import React from 'react';
import { ExecutionResult, getExecutionStatus } from './ExecutionResultWidget';
import { getSectionCells } from './getSectionCells';
import { SectionRunButton } from './SectionRunButton';

export class SectionSummaryWidget extends ReactWidget {
  constructor(
    private cell: MarkdownCell,
    private notebook: Notebook,
    private sessionContext: ISessionContext
  ) {
    super();

    this.addClass('lc-SectionSummary');
  }

  render(): JSX.Element {
    const sectionCells = getSectionCells(this.cell, this.notebook).map(
      (cell, i) => {
        if (isCodeCellModel(cell.model)) {
          return (
            <UseSignal key={cell.model.id} signal={cell.model.stateChanged}>
              {() => (
                <ExecutionResult
                  status={getExecutionStatus(cell as CodeCell)}
                />
              )}
            </UseSignal>
          );
        } else if (isMarkdownCellModel(cell.model)) {
          const markdownElement = (cell as MarkdownCell).node.querySelector(
            '.jp-MarkdownOutput'
          );
          const __html = markdownElement?.innerHTML ?? '';
          return (
            <div
              key={cell.model.id}
              className="markdown-result"
              dangerouslySetInnerHTML={{ __html }}
            ></div>
          );
        } else {
          return (
            <div key={cell.model.id} className="text-result">
              {cell.inputArea.model.value.text}
            </div>
          );
        }
      }
    );
    return (
      <div>
        <div>
          <SectionRunButton
            cell={this.cell}
            notebook={this.notebook}
            sessionContext={this.sessionContext}
          />
        </div>
        {sectionCells}
      </div>
    );
  }
}
