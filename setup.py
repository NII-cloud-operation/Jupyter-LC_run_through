#!/usr/bin/env python

from setuptools import setup
import os
import sys

HERE = os.path.abspath(os.path.dirname(__file__))
VERSION_NS = {}
with open(os.path.join(HERE, 'lc_run_through', '_version.py')) as f:
    exec(f.read(), {}, VERSION_NS)

setup_args = dict (name='lc-run-through',
      version=VERSION_NS['__version__'],
      description='LC run through extension for Jupyter Notebook',
      packages=['lc_run_through'],
      include_package_data=True,
      platforms=['Jupyter Notebook 4.2.x', 'Jupyter Notebook 5.x'],
      zip_safe=False,
      install_requires=[
          'notebook>=4.2.0',
      ],
      entry_points={
          'console_scripts': [
              'jupyter-run-through = lc_run_through.extensionapp:main'
          ]
      }
)

if __name__ == '__main__':
    setup(**setup_args)

