FROM debian:stable-slim

ARG USER_ID
ARG GROUP_ID

# Installing node & npm
RUN apt-get update && apt-get -y install npm curl nginx sudo
RUN npm install -g n
RUN n 16
RUN npm i npm@next-7 -g
RUN mkdir /var/www/public

# Create user / group
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
RUN addgroup --system --gid ${GROUP_ID} docker
RUN adduser --shell /bin/bash --system --home /project --ingroup docker --ingroup sudo -u ${USER_ID}  docker

USER docker

EXPOSE 80
WORKDIR /project
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
