#!/bin/bash
echo 'starting checkCard screen'
sleep 1
screen -S cardCheck -d -m python2 /opt/magstripe/scripts/checkCard.py