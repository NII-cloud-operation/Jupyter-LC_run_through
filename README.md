![demo](./demo.gif)

# Jupyter-LC_run_through

This extension enables to execute cells contained in a collapsed heading section
with one click, and view a summary of hidden outputs.

Successfully executed cells are frozen automatically to prevent to re-run.

# Prerequisite

* [Jupyter Lab](https://github.com/jupyterlab/jupyterlab) >= 4.0.0
* [Collapsible Headings extension](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/tree/master/src/jupyter_contrib_nbextensions/nbextensions/collapsible_headings) is installed and enabled

#  How to install

## Installing run-through extension

Install the python package

    $ pip install git+https://github.com/NII-cloud-operation/Jupyter-LC_run_through

Install and enable this extension and enable required extensions

    $ jupyter run-through quick-setup

Disable and uninstall this extension

    $ jupyter run-through quick-remove

## Updating Font Awesome

The extension uses latest(test with 4.7.0) [Font Awesome](http://fontawesome.io/) icons.
If you use Jupyter Notebook Server 5.0.0 or earlier, you should update Font Awesome as follows:

1. Retrieve the notebook installed path

    ```
    $ find /usr -name FontAwesome.otf | grep notebook
    /usr/local/lib/python2.7/dist-packages/notebook/static/components/font-awesome/fonts/FontAwesome.otf
    ```

2. Download and Update Font Awesome

    ```
    cd /tmp/
    curl -O http://fontawesome.io/assets/font-awesome-4.7.0.zip
    unzip font-awesome-4.7.0.zip
    cp font-awesome-4.7.0/fonts/* /usr/local/lib/python2.7/dist-packages/notebook/static/components/font-awesome/fonts/
    ```

# How to use

## Collapse headings

Any markdown heading cell (that is, one which begins with 1-6 # characters), becomes collapsible once rendered.

Please see [readme.md of Collapsible Headings ](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/blob/master/src/jupyter_contrib_nbextensions/nbextensions/collapsible_headings/readme.md) about details.

## Run-through button and summary of outputs

The run-through button and summary of outputs appear in a collapsed heading cell.

![Collapsed View](lc_run_through/nbextension/icon.png)

The code cells which are collapsed appear as colored bricks.
The colors mean as follows:

- Gray: Not Executed
- Green: Successfully Executed
- Pink: Failed

A brick with a snowflake means it is *Frozen* cell as below.

![Expanded View](lc_run_through/nbextension/expanded.png)

The extension provides *Lock*(make the cell read only) and *Freeze*(prevent re-execution) functions like [Freeze extention ](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/tree/master/src/jupyter_contrib_nbextensions/nbextensions/freeze), but also allows to control the *Locked(Read Only)* and *Frozen* states separately.

## Toolbar

When the extension is enabled, the buttons below appear on the toolbar.

![Unfreeze Buttons](lc_run_through/nbextension/unfreeze-buttons.png)

For the *Locked(Read Only)* state:

- Make selected cells read-only
- Make selected cells editable

For the *Frozen* state:

- Freeze selected cells
- Unfreeze selected cells
- Unfreeze below in section
- Unfreeze below all

## Uninstall

To remove the extension, execute:

```bash
pip uninstall lc_run_through
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the lc_run_through directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall lc_run_through
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `lc_run_through` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)
