import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the lc_run_through extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'lc_run_through:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension lc_run_through is activated!');
  }
};

export default plugin;
