#!/bin/bash
cd /project

if [ "$MODE" = "dev" ]; then
  echo "/!\\ Mode is set to DEV /!\\"
else
  echo "/!\\ Mode is set to PRODUCTION /!\\"
fi
echo "(i) Npm version is $(npm -v)"
echo "(i) Node version is $(node -v)"

source .env

echo
echo " ~"
echo " ~ Install dependencies"
echo " ~"
echo
npm install

if [ "$MODE" = "dev" ]; then

  echo
  echo " ~"
  echo " ~ Start the web server"
  echo " ~"
  echo
  nginx -c /etc/nginx/nginx.conf

  echo
  echo " ~"
  echo " ~ Start project"
  echo " ~"
  echo
  npm run start

else
  source .env.production

  echo
  echo " ~"
  echo " ~ Building project"
  echo " ~"
  echo
  npm run build

  echo
  echo " ~"
  echo " ~ Run nginx"
  echo " ~"
  echo
  nginx -g 'daemon off;'
fi

set +o allexport
