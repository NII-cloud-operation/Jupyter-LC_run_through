// import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { CodeCell } from '@jupyterlab/cells';
import { IOutputAreaModel } from '@jupyterlab/outputarea';
import React from 'react';

type ExecutionResultStatus = 'success' | 'error' | 'pending';

interface IProps {
  status: ExecutionResultStatus;
  frozen: boolean;
}

export function ExecutionResult({ status, frozen }: IProps): JSX.Element {
  const className = ['run-through-code-result'];

  if (status === 'success') {
    className.push('run-through-code-result__success');
  }
  if (status === 'error') {
    className.push('run-through-code-result__error');
  }

  if (frozen) {
    className.push('far fa-snowflake');
  }

  return <span className={className.join(' ')}></span>;
}

function hasError(outputModel: IOutputAreaModel) {
  for (let i = 0; i < outputModel.length; i++) {
    const output = outputModel.get(i);
    if (output.type === 'error') {
      return true;
    }
  }
  return false;
}

export function getExecutionStatus(cell: CodeCell): ExecutionResultStatus {
  // 結果を消去した、または実行中
  if (!cell.model.executionCount) {
    return 'pending';
  }

  // 結果が出た
  if (hasError(cell.outputArea.model)) {
    return 'error';
  } else {
    return 'success';
  }
}
