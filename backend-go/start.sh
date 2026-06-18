#!/bin/sh
PORT=5000 ./server &
peer --port 5001 --path /peerjs &
nginx -g "daemon off;"
