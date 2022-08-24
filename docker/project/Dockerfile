FROM debian:stable-slim

# Installing node & npm
RUN apt-get update && apt-get -y install npm curl nginx
RUN npm install -g n
RUN n 16
RUN npm i npm@next-7 -g
RUN mkdir /var/www/public
EXPOSE 80
WORKDIR /project
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
