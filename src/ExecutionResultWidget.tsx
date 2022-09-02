// import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import { CodeCell } from '@jupyterlab/cells';
import { IOutputAreaModel } from '@jupyterlab/outputarea';
import React from 'react';

type ExecutionResultStatus = 'success' | 'error' | 'pending';

// export class ExecutionResultWidget extends ReactWidget {
//   constructor(private cell: CodeCell) {
//     super();
//   }

//   render(): JSX.Element {
//     return (
//       <UseSignal signal={this.cell.model.stateChanged}>
//         {() => {
//           return <ExecutionResult status={getExecutionStatus(this.cell)} />;
//         }}
//       </UseSignal>
//     );
//   }
// }

export function ExecutionResult({
  status
}: {
  status: ExecutionResultStatus;
}): JSX.Element {
  if (status === 'success') {
    return <div>success</div>;
  }

  if (status === 'error') {
    return <div>error</div>;
  }

  return <div>no result</div>;
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
