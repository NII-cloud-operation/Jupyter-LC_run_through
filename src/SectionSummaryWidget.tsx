import { ISessionContext, ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { CodeCell, isCodeCellModel, MarkdownCell } from '@jupyterlab/cells';
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
    const sectionCells = getSectionCells(this.cell, this.notebook)
      .filter(c => isCodeCellModel(c.model))
      .map((c, i) => (
        <UseSignal key={i} signal={c.model.stateChanged}>
          {() => <ExecutionResult status={getExecutionStatus(c as CodeCell)} />}
        </UseSignal>
      ));
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
