from notebook.base.handlers import IPythonHandler
from notebook.utils import url_path_join

# nbextension
def _jupyter_nbextension_paths():
    return [dict(
        section="notebook",
        src="nbextension",
        dest="run_through",
        require="run_through/main")]

