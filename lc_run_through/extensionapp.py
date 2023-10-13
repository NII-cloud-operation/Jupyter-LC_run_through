import os.path
import sys
import io

from ._version import __version__

from nbclassic.nbextensions import (InstallNBExtensionApp, EnableNBExtensionApp,
    DisableNBExtensionApp, UninstallNBExtensionApp)

from jupyter_server.extension.serverextension import BaseExtensionApp
try:
    from jupyter_server.extension.serverextension import BaseExtensionApp
except ImportError:
    from nbclassic.extensions import BaseNBExtensionApp
    BaseExtensionApp = BaseNBExtensionApp

# from notebook import nbextensions
from jupyter_server.extension.serverextension import (
    EnableServerExtensionApp,
    DisableServerExtensionApp)

from traitlets.config.application import catch_config_error
from traitlets.config.application import Application

class ExtensionQuickSetupApp(BaseExtensionApp):
    """Installs and enables all parts of this extension"""
    name = "jupyter run-through quick-setup"
    version = __version__
    description = "Installs and enables all features of the LC run through extension"

    def start(self):
        self.argv.extend(['--py', 'lc_run_through'])

        install = InstallNBExtensionApp()
        install.initialize(self.argv)
        install.start()
        enable = EnableNBExtensionApp()
        enable.initialize(self.argv)
        enable.start()

        print('Enables dependecy extensions')
        self.enable_collapsible_headings()

    def enable_collapsible_headings(self):
        enable = EnableNBExtensionApp()
        enable.initialize(['collapsible_headings/main'])
        enable.start();


class ExtensionQuickRemovalApp(BaseExtensionApp):
    """Disables and uninstalls all parts of this extension"""
    name = "jupyter run-through quick-remove"
    version = __version__
    description = "Disables and removes all features of the LC run through extension"

    def start(self):
        self.argv.extend(['--py', 'lc_run_through'])

        disable = DisableNBExtensionApp()
        disable.initialize(self.argv)
        disable.start()
        uninstall = UninstallNBExtensionApp()
        uninstall.initialize(self.argv)
        uninstall.start()

class ExtensionApp(Application):
    '''CLI for extension management.'''
    name = u'jupyter run-through'
    description = u'Utilities for managing the LC run through extension'
    examples = ""
    version = __version__

    subcommands = dict()

    subcommands.update({
        "quick-setup": (
            ExtensionQuickSetupApp,
            "Install and enable everything in the package"
        ),
        "quick-remove": (
            ExtensionQuickRemovalApp,
            "Disable and uninstall everything in the package"
        ),
    })

    def _classes_default(self):
        classes = super(ExtensionApp, self)._classes_default()

        # include all the apps that have configurable options
        for appname, (app, help) in self.subcommands.items():
            if len(app.class_traits(config=True)) > 0:
                classes.append(app)

    @catch_config_error
    def initialize(self, argv=None):
        super(ExtensionApp, self).initialize(argv)

    def start(self):
        # check: is there a subapp given?
        if self.subapp is None:
            self.print_help()
            sys.exit(1)

        # This starts subapps
        super(ExtensionApp, self).start()

def main():
    ExtensionApp.launch_instance()
