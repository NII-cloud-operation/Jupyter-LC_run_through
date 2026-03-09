import { ICellModel } from '@jupyterlab/cells';

export interface ICellState {
  frozen: boolean;
  read_only: boolean;
}

export function getCellState(cellModel: ICellModel): ICellState {
  const state = cellModel.getMetadata(
    'run_through_control'
  ) as ICellState | null;
  return state ? state : { frozen: false, read_only: false };
}

export function setCellState(
  cellModel: ICellModel,
  state: Partial<ICellState>
): void {
  cellModel.setMetadata('run_through_control', {
    ...getCellState(cellModel),
    ...state
  });

  const locked = state.frozen || state.read_only;
  cellModel.setMetadata('editable', !locked);
  cellModel.setMetadata('deletable', !locked);

  //   cell.code_mirror.setOption('readOnly', !cell.metadata.editable);
  //   var inputArea = cell.element.find('div.input_area');
  //   if (should_read_only) {
  //     inputArea.css('background-color', options.readonly_color);
  //   } else {
  //     inputArea.css('background-color', '');
  //   }
  //   var prompt = cell.element.find('div.input_prompt bdi');
  //   if (should_frozen) {
  //     prompt.addClass('prompt-freeze');
  //     prompt.css('background-color', options.frozen_color);
  //   } else {
  //     prompt.removeClass('prompt-freeze');
  //     prompt.css('background-color', '');
  //   }
}
