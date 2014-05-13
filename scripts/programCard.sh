#!/bin/bash
# Make sure only root can run our script
if [ "$(id -u)" != "0" ]; then
	echo "This script must be run as root" 1>&2
	exit 1
fi
bash /opt/magstripe/scripts/stop.sh
pkill -9 python
python2 /opt/magstripe/scripts/programCard.py
bash /opt/magstripe/scripts/start.sh