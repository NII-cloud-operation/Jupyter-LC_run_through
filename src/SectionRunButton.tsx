import { ISessionContext } from '@jupyterlab/apputils';
import { MarkdownCell } from '@jupyterlab/cells';
import { Notebook } from '@jupyterlab/notebook';
import React from 'react';
import { runSectionCells } from './runSectionCells';

export function SectionRunButton({
  cell,
  notebook,
  sessionContext
}: {
  cell: MarkdownCell;
  notebook: Notebook;
  sessionContext: ISessionContext;
}): JSX.Element {
  const [runButtonDisabled, setRunButtonDisabled] = React.useState(false);

  const run = async () => {
    setRunButtonDisabled(true);
    await runSectionCells(cell, notebook, sessionContext);
    setRunButtonDisabled(false);
  };

  return (
    <button
      onClick={run}
      disabled={runButtonDisabled}
      className="run-through-button"
    >
      <i className="fa fa-play-circle"></i>
    </button>
  );
}
