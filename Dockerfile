FROM jupyter/scipy-notebook:latest

USER root

### extensions for jupyter
COPY . /tmp/run_through
RUN pip --no-cache-dir install jupyter_nbextensions_configurator \
    /tmp/run_through

RUN jupyter nbclassic-extension install --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-extension enable --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-serverextension enable --py jupyter_nbextensions_configurator --sys-prefix && \
    jupyter nbclassic-extension install --py lc_run_through --sys-prefix && \
    jupyter nbclassic-extension enable --py lc_run_through --sys-prefix && \
    fix-permissions /home/$NB_USER

# Make classic notebook the default
ENV DOCKER_STACKS_JUPYTER_CMD=nbclassic

USER $NB_USER
