# Jupyter-LC_run_through

This extension enables to execute cells contained in a collapsed heading section
with one click, and view a summary of hidden outputs.

Successfully executed cells are frozen automatically to prevent to re-run.

# Prerequisite

* [Jupyter Notebook](https://github.com/jupyter/notebook) 4.2.x or 5.x
* [Collapsible Headings extension](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/tree/master/src/jupyter_contrib_nbextensions/nbextensions/collapsible_headings) is installed and enabled
* [Freeze extension](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/tree/master/src/jupyter_contrib_nbextensions/nbextensions/freeze) is installed and enabled

#  How to install

Install the python package

    $ pip install git+https://github.com/NII-cloud-operation/Jupyter-LC_run_through

Install and enable this extension and enable required extensions

    $ jupyter run-through quick-setup

Disable and uninstall this extension

    $ jupyter run-through quick-remove

# How to use

## Collapse headings

Any markdown heading cell (that is, one which begins with 1-6 # characters), becomes collapsible once rendered.

Please see [readme.md of Collapsible Headings ](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/blob/master/src/jupyter_contrib_nbextensions/nbextensions/collapsible_headings/readme.md) about details.

## Run-through button and summary of outputs

The run-through button and summary of outputs appear in a collapsed heading cell.

![Unfreeze Buttons](lc_run_through/nbextension/icon.png)

## Unfreeze buttons

![Unfreeze Buttons](lc_run_through/nbextension/unfreeze-buttons.png)
