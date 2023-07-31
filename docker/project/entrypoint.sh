#!/bin/bash
cd /project

if [ "$MODE" = "dev" ]; then
  echo "/!\\ Mode is set to DEV /!\\"
else
  echo "/!\\ Mode is set to PRODUCTION /!\\"
fi
echo "(i) Npm version is $(npm -v)"
echo "(i) Node version is $(node -v)"
env
sudo chmod -R 777 /var/www/public

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
  sudo nginx -c /etc/nginx/nginx.conf

  echo
  echo " ~"
  echo " ~ Start project"
  echo " ~"
  echo
  npm run start

else
  echo
  echo " ~"
  echo " ~ Building project"
  echo " ~"
  echo
  npm run build

  echo
  echo " ~"
  echo " ~ Data prep"
  echo " ~"
  echo
  npm run exec --workspace=@lasso/dataprep

  echo
  echo " ~"
  echo " ~ Run nginx"
  echo " ~"
  echo
  sudo nginx -g 'daemon off;'
fi
