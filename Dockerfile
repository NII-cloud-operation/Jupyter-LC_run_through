FROM quay.io/jupyter/scipy-notebook:latest

USER root

### extensions for jupyter
COPY . /tmp/run_through
RUN pip --no-cache-dir install jupyter_nbextensions_configurator \
    jupyter_contrib_nbextensions autopep8 \
    git+https://github.com/NII-cloud-operation/Jupyter-multi_outputs.git@feature/lab \
    /tmp/run_through

RUN jupyter labextension enable lc_run_through && \
    jupyter labextension enable lc_multi_outputs && \
    jupyter run-through quick-setup --sys-prefix && \
    npm cache clean --force

RUN jupyter nbclassic-extension install --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-extension enable --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-serverextension enable --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-extension install --py jupyter_contrib_nbextensions --sys-prefix && \
    jupyter nbclassic-extension enable --py jupyter_contrib_nbextensions --sys-prefix && \
    jupyter nbclassic-serverextension enable --py jupyter_contrib_nbextensions --sys-prefix && \
    jupyter nbclassic-extension install --py lc_multi_outputs --sys-prefix && \
    jupyter nbclassic-extension enable --py lc_multi_outputs --sys-prefix && \
    jupyter nbclassic-extension install --py lc_run_through --sys-prefix && \
    jupyter nbclassic-extension enable --py lc_run_through --sys-prefix && \
    fix-permissions /home/$NB_USER

USER $NB_USER