import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { ICellModel } from '@jupyterlab/cells';
import React from 'react';
import { getCellState } from './cell-state-utils';

export class FrozenWidget extends ReactWidget {
  constructor(private cellModel: ICellModel) {
    super();
    this.addClass('RunThrough-FrozenWidget');
  }

  render(): JSX.Element {
    return (
      <UseSignal signal={this.cellModel.metadata.changed}>
        {() => {
          const state = getCellState(this.cellModel);
          if (state.frozen) {
            return (
              <span className="fa fa-snowflake run-through-prompt-frozen"></span>
            );
          }
          return <></>;
        }}
      </UseSignal>
    );
  }
}
