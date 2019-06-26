#!/bin/sh

ssh ezderman@159.65.240.12 <<EOF
  cd ~/node-app
  git pull
  npm install --production
  pm2 restart all
  exit
EOF