#!/bin/sh
ls
echo 'Hello -------------------> world :)'
docker ps
docker exec -it ceb9894bd77c bash
ls /home/node/node_restaurant_backend